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

export type EditorialVideoSummary = {
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

export type VideoEditorialDetail = {
  youtube_video_id: string
  slug: string | null
  title: string
  description: string | null
  published_at: string | null
}

export type VideoEditorialClassificationRow = {
  dimension_code: string
  term_slug: string
  term_label: string
  source_kind: string
  source_ref: string | null
  confidence: number
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

export async function getVideoSummaryByYoutubeId(youtubeVideoId: string): Promise<EditorialVideoSummary | null> {
  const res = await supabaseService
    .from("videos")
    .select("youtube_video_id, title, published_at")
    .eq("youtube_video_id", youtubeVideoId)
    .maybeSingle()

  if (res.error) throw new Error(res.error.message)
  if (!res.data || typeof res.data.youtube_video_id !== "string") return null

  return {
    youtube_video_id: res.data.youtube_video_id,
    title: typeof res.data.title === "string" ? res.data.title : "Sin título",
    published_at: typeof res.data.published_at === "string" ? res.data.published_at : null,
  }
}

export async function listLatestVideoSummaries(limit = 10): Promise<EditorialVideoSummary[]> {
  const res = await supabaseService
    .from("videos")
    .select("youtube_video_id, title, published_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (res.error || !Array.isArray(res.data)) return []

  return res.data
    .map((row: any) => ({
      youtube_video_id: typeof row?.youtube_video_id === "string" ? row.youtube_video_id : "",
      title: typeof row?.title === "string" ? row.title : "Sin título",
      published_at: typeof row?.published_at === "string" ? row.published_at : null,
    }))
    .filter((row) => row.youtube_video_id.length > 0)
}

export async function searchVideoSummariesByTitle(query: string, limit = 10): Promise<EditorialVideoSummary[]> {
  const normalized = query.trim()
  if (!normalized) return []

  const res = await supabaseService
    .from("videos")
    .select("youtube_video_id, title, published_at")
    .ilike("title", `%${normalized}%`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (res.error || !Array.isArray(res.data)) return []

  return res.data
    .map((row: any) => ({
      youtube_video_id: typeof row?.youtube_video_id === "string" ? row.youtube_video_id : "",
      title: typeof row?.title === "string" ? row.title : "Sin título",
      published_at: typeof row?.published_at === "string" ? row.published_at : null,
    }))
    .filter((row) => row.youtube_video_id.length > 0)
}

export async function getVideoEditorialDetailByYoutubeId(youtubeVideoId: string): Promise<VideoEditorialDetail | null> {
  const res = await supabaseService
    .from("videos")
    .select("youtube_video_id, slug, title, description, published_at")
    .eq("youtube_video_id", youtubeVideoId)
    .maybeSingle()

  if (res.error || !res.data || typeof res.data.youtube_video_id !== "string") return null

  return {
    youtube_video_id: res.data.youtube_video_id,
    slug: typeof res.data.slug === "string" ? res.data.slug : null,
    title: typeof res.data.title === "string" ? res.data.title : "Sin título",
    description: typeof res.data.description === "string" ? res.data.description : null,
    published_at: typeof res.data.published_at === "string" ? res.data.published_at : null,
  }
}

export async function listVideoEditorialClassificationByYoutubeId(
  youtubeVideoId: string
): Promise<VideoEditorialClassificationRow[]> {
  const videoRes = await supabaseService
    .from("videos")
    .select("id")
    .eq("youtube_video_id", youtubeVideoId)
    .maybeSingle()

  if (videoRes.error || !videoRes.data?.id) return []

  const [dimensionsRes, termsRes, currentRes] = await Promise.all([
    supabaseService.from("editorial_dimensions").select("id, code"),
    supabaseService.from("editorial_terms").select("id, slug, label"),
    supabaseService
      .from("video_editorial_classification_current")
      .select("dimension_id, term_id, source_kind, source_ref, confidence")
      .eq("video_id", videoRes.data.id),
  ])

  if (dimensionsRes.error || termsRes.error || currentRes.error) return []

  const dimensionById = new Map((dimensionsRes.data ?? []).map((row: any) => [row.id, row.code]))
  const termById = new Map((termsRes.data ?? []).map((row: any) => [row.id, { slug: row.slug, label: row.label }]))

  return (currentRes.data ?? [])
    .map((row: any) => {
      const dimensionCode = dimensionById.get(row.dimension_id)
      const term = termById.get(row.term_id)
      if (!dimensionCode || !term) return null
      return {
        dimension_code: dimensionCode,
        term_slug: term.slug,
        term_label: term.label,
        source_kind: typeof row?.source_kind === "string" ? row.source_kind : "",
        source_ref: typeof row?.source_ref === "string" ? row.source_ref : null,
        confidence: typeof row?.confidence === "number" ? row.confidence : Number(row?.confidence ?? 0),
      }
    })
    .filter((row): row is VideoEditorialClassificationRow => Boolean(row))
}

export async function listVideosWithoutSeriesCollection(limit = 10): Promise<EditorialVideoSummary[]> {
  const dimensionRes = await supabaseService
    .from("editorial_dimensions")
    .select("id")
    .eq("code", "series_collection")
    .maybeSingle()

  if (dimensionRes.error || !dimensionRes.data?.id) return []

  const [videosRes, classifiedRes] = await Promise.all([
    supabaseService
      .from("videos")
      .select("id, youtube_video_id, title, published_at")
      .order("published_at", { ascending: false, nullsFirst: false }),
    supabaseService
      .from("video_editorial_classification_current")
      .select("video_id")
      .eq("dimension_id", dimensionRes.data.id),
  ])

  if (videosRes.error || classifiedRes.error || !Array.isArray(videosRes.data)) return []

  const classifiedIds = new Set(
    (classifiedRes.data ?? [])
      .map((row: any) => (typeof row?.video_id === "string" ? row.video_id : ""))
      .filter((value) => value.length > 0)
  )

  return videosRes.data
    .filter((row: any) => !classifiedIds.has(typeof row?.id === "string" ? row.id : ""))
    .slice(0, limit)
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

export async function saveVideoSearchPrompt(chatId: number, fromId: number): Promise<void> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const deactivateRes = await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "video_search_prompt")
    .eq("is_active", true)

  if (deactivateRes.error) throw new Error(deactivateRes.error.message)

  const insertRes = await supabaseService
    .from("telegram_list_contexts")
    .insert({
      chat_id: chatId,
      from_id: fromId,
      context_type: "video_search_prompt",
      category_slug: "search",
      list_offset: 0,
      items: [],
      expires_at: expiresAt,
      is_active: true,
    })

  if (insertRes.error) throw new Error(insertRes.error.message)
}

export async function hasActiveVideoSearchPrompt(chatId: number, fromId: number): Promise<boolean> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .select("id")
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "video_search_prompt")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle()

  if (res.error) return false
  return Boolean(res.data?.id)
}

export async function clearVideoSearchPrompt(chatId: number, fromId: number): Promise<void> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "video_search_prompt")
    .eq("is_active", true)

  if (res.error) throw new Error(res.error.message)
}
