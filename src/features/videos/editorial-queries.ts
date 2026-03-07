import { supabaseService } from "@/lib/supabase/client-service"

export type EditorialTelegramCategory =
  | "series-biblicas"
  | "watchman-nee"
  | "lives"
  | "cortes"
  | "shorts"
  | "club-del-libro"
  | "reflexiones"
  | "ensenanzas"

type CategoryFilter = {
  dimensionCode: "content_type" | "series_collection"
  termSlug: string
}

export type EditorialVideoListItem = {
  youtube_video_id: string
  title: string
  published_at: string | null
}

type TelegramVideoListContextRow = {
  id?: string
  chat_id?: number
  from_id?: number
  context_type?: string
  category_slug?: string
  list_offset?: number
  items?: unknown
  created_at?: string
  expires_at?: string
  is_active?: boolean
}

export type TelegramEditorialListContextItem = {
  index: number
  youtube_video_id: string
  title: string
  published_at: string | null
}

export type TelegramEditorialListContext = {
  category_slug: EditorialTelegramCategory
  offset: number
  items: TelegramEditorialListContextItem[]
  expires_at: string
}

export const TELEGRAM_EDITORIAL_CATEGORIES: Array<{
  slug: EditorialTelegramCategory
  label: string
  filter: CategoryFilter
}> = [
  { slug: "series-biblicas", label: "series-biblicas", filter: { dimensionCode: "content_type", termSlug: "series_episode" } },
  { slug: "watchman-nee", label: "watchman-nee", filter: { dimensionCode: "series_collection", termSlug: "watchman_nee" } },
  { slug: "lives", label: "lives", filter: { dimensionCode: "content_type", termSlug: "live" } },
  { slug: "cortes", label: "cortes", filter: { dimensionCode: "content_type", termSlug: "clip" } },
  { slug: "shorts", label: "shorts", filter: { dimensionCode: "content_type", termSlug: "short" } },
  { slug: "club-del-libro", label: "club-del-libro", filter: { dimensionCode: "content_type", termSlug: "book_club" } },
  { slug: "reflexiones", label: "reflexiones", filter: { dimensionCode: "content_type", termSlug: "reflection" } },
  { slug: "ensenanzas", label: "ensenanzas", filter: { dimensionCode: "content_type", termSlug: "teaching" } },
]

export function getTelegramEditorialCategory(slug: string) {
  return TELEGRAM_EDITORIAL_CATEGORIES.find((item) => item.slug === slug)
}

function normalizeContextItems(items: EditorialVideoListItem[], offset: number): TelegramEditorialListContextItem[] {
  return items.map((item, index) => ({
    index: offset + index + 1,
    youtube_video_id: item.youtube_video_id,
    title: item.title,
    published_at: item.published_at,
  }))
}

function parseContextItems(value: unknown): TelegramEditorialListContextItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      const row = item as Record<string, unknown>
      return {
        index: typeof row?.index === "number" ? row.index : NaN,
        youtube_video_id: typeof row?.youtube_video_id === "string" ? row.youtube_video_id : "",
        title: typeof row?.title === "string" ? row.title : "Sin título",
        published_at: typeof row?.published_at === "string" ? row.published_at : null,
      }
    })
    .filter((item) => Number.isInteger(item.index) && item.index > 0 && item.youtube_video_id.length > 0)
}

export async function listVideosByTelegramEditorialCategory(
  categorySlug: EditorialTelegramCategory,
  offset = 0,
  limit = 10
): Promise<EditorialVideoListItem[]> {
  const category = getTelegramEditorialCategory(categorySlug)
  if (!category) return []

  const dimensionRes = await supabaseService
    .from("editorial_dimensions")
    .select("id")
    .eq("code", category.filter.dimensionCode)
    .maybeSingle()

  if (dimensionRes.error) throw new Error(dimensionRes.error.message)
  if (!dimensionRes.data?.id) return []

  const termRes = await supabaseService
    .from("editorial_terms")
    .select("id")
    .eq("dimension_id", dimensionRes.data.id)
    .eq("slug", category.filter.termSlug)
    .maybeSingle()

  if (termRes.error) throw new Error(termRes.error.message)
  if (!termRes.data?.id) return []

  const currentRes = await supabaseService
    .from("video_editorial_classification_current")
    .select("video_id")
    .eq("dimension_id", dimensionRes.data.id)
    .eq("term_id", termRes.data.id)

  if (currentRes.error) throw new Error(currentRes.error.message)

  const videoIds = (currentRes.data ?? [])
    .map((row: any) => (typeof row?.video_id === "string" ? row.video_id : ""))
    .filter((value) => value.length > 0)

  if (videoIds.length === 0) return []

  const videosRes = await supabaseService
    .from("videos")
    .select("youtube_video_id, title, published_at")
    .in("id", videoIds)
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (videosRes.error) throw new Error(videosRes.error.message)

  return (videosRes.data ?? [])
    .map((row: any) => ({
      youtube_video_id: typeof row?.youtube_video_id === "string" ? row.youtube_video_id : "",
      title: typeof row?.title === "string" ? row.title : "Sin título",
      published_at: typeof row?.published_at === "string" ? row.published_at : null,
    }))
    .filter((row) => row.youtube_video_id.length > 0)
}

export async function saveTelegramEditorialListContext(
  chatId: number,
  fromId: number,
  categorySlug: EditorialTelegramCategory,
  offset: number,
  items: EditorialVideoListItem[]
): Promise<void> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  const normalizedItems = normalizeContextItems(items, offset)

  const deactivateRes = await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "editorial_video_list")
    .eq("is_active", true)

  if (deactivateRes.error) throw new Error(deactivateRes.error.message)

  const insertRes = await supabaseService
    .from("telegram_list_contexts")
    .insert({
      chat_id: chatId,
      from_id: fromId,
      context_type: "editorial_video_list",
      category_slug: categorySlug,
      list_offset: offset,
      items: normalizedItems,
      expires_at: expiresAt,
      is_active: true,
    })

  if (insertRes.error) throw new Error(insertRes.error.message)
}

export async function getActiveTelegramEditorialListContext(
  chatId: number,
  fromId: number
): Promise<TelegramEditorialListContext | null> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .select("category_slug, list_offset, items, expires_at")
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "editorial_video_list")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (res.error) throw new Error(res.error.message)
  if (!res.data) return null

  const row = res.data as TelegramVideoListContextRow
  const category = typeof row.category_slug === "string" ? getTelegramEditorialCategory(row.category_slug) : null
  if (!category) return null

  return {
    category_slug: category.slug,
    offset: typeof row.list_offset === "number" ? row.list_offset : 0,
    items: parseContextItems(row.items),
    expires_at: typeof row.expires_at === "string" ? row.expires_at : new Date().toISOString(),
  }
}
