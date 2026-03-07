import { supabasePublic } from "@/lib/supabase/client-public"
import { supabaseService } from "@/lib/supabase/client-service"

export type DailyReading = {
  title: string
  content_md: string
  reference_text: string | null
  author: string | null
  is_published: boolean
  set_by: string | null
  set_at: string
  updated_by: string | null
  updated_at: string
  created_at: string
}

export type DailyReadingDraft = {
  title: string
  content_md: string
  reference_text: string
  author: string
}

function mapDailyReading(row: any): DailyReading | null {
  if (typeof row?.title !== "string" || typeof row?.content_md !== "string") return null

  return {
    title: row.title,
    content_md: row.content_md,
    reference_text: typeof row?.reference_text === "string" ? row.reference_text : null,
    author: typeof row?.author === "string" ? row.author : null,
    is_published: typeof row?.is_published === "boolean" ? row.is_published : false,
    set_by: typeof row?.set_by === "string" ? row.set_by : null,
    set_at: typeof row?.set_at === "string" ? row.set_at : "",
    updated_by: typeof row?.updated_by === "string" ? row.updated_by : null,
    updated_at: typeof row?.updated_at === "string" ? row.updated_at : "",
    created_at: typeof row?.created_at === "string" ? row.created_at : "",
  }
}

export async function getDailyReadingCurrent(): Promise<DailyReading | null> {
  const res = await supabaseService
    .from("daily_reading_current")
    .select("title, content_md, reference_text, author, is_published, set_by, set_at, updated_by, updated_at, created_at")
    .eq("id", 1)
    .maybeSingle()

  if (res.error || !res.data) return null
  return mapDailyReading(res.data)
}

export async function getPublicDailyReadingCurrent(): Promise<DailyReading | null> {
  const res = await supabasePublic
    .from("daily_reading_current")
    .select("title, content_md, reference_text, author, is_published, set_by, set_at, updated_by, updated_at, created_at")
    .eq("id", 1)
    .eq("is_published", true)
    .maybeSingle()

  if (res.error || !res.data) return null
  return mapDailyReading(res.data)
}

export async function publishDailyReadingCurrent(draft: DailyReadingDraft, actor: string): Promise<boolean> {
  const now = new Date().toISOString()
  const payload = {
    id: 1,
    title: draft.title.trim(),
    content_md: draft.content_md.trim(),
    reference_text: draft.reference_text.trim() || null,
    author: draft.author.trim() || null,
    is_published: true,
    set_by: actor,
    set_at: now,
    updated_by: actor,
    updated_at: now,
  }

  if (!payload.title || !payload.content_md) return false

  const res = await supabaseService
    .from("daily_reading_current")
    .upsert(payload, { onConflict: "id" })

  return !res.error
}

type ReadingEditorContextRow = {
  items?: unknown
}

type ReadingEditorContextPayload = {
  mode: "create" | "edit"
  field: "title" | "content_md" | "reference_text" | "author" | null
  draft: DailyReadingDraft
}

function parseReadingEditorPayload(row: ReadingEditorContextRow | null | undefined): ReadingEditorContextPayload | null {
  if (!row || !Array.isArray(row.items) || row.items.length === 0) return null
  const first = row.items[0] as Record<string, unknown>
  const draft = (first?.draft ?? {}) as Record<string, unknown>
  const mode = first?.mode === "edit" ? "edit" : "create"
  const field =
    first?.field === "title" ||
    first?.field === "content_md" ||
    first?.field === "reference_text" ||
    first?.field === "author"
      ? first.field
      : null

  return {
    mode,
    field,
    draft: {
      title: typeof draft?.title === "string" ? draft.title : "",
      content_md: typeof draft?.content_md === "string" ? draft.content_md : "",
      reference_text: typeof draft?.reference_text === "string" ? draft.reference_text : "",
      author: typeof draft?.author === "string" ? draft.author : "",
    },
  }
}

export async function saveReadingEditorContext(
  chatId: number,
  fromId: number,
  payload: ReadingEditorContextPayload
): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

  await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "reading_editor")
    .eq("is_active", true)

  const insertRes = await supabaseService
    .from("telegram_list_contexts")
    .insert({
      chat_id: chatId,
      from_id: fromId,
      context_type: "reading_editor",
      category_slug: "daily_reading",
      list_offset: 0,
      items: [payload],
      expires_at: expiresAt,
      is_active: true,
    })

  if (insertRes.error) throw new Error(insertRes.error.message)
}

export async function getReadingEditorContext(chatId: number, fromId: number): Promise<ReadingEditorContextPayload | null> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .select("items")
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "reading_editor")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (res.error || !res.data) return null
  return parseReadingEditorPayload(res.data)
}

export async function clearReadingEditorContext(chatId: number, fromId: number): Promise<void> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "reading_editor")
    .eq("is_active", true)

  if (res.error) throw new Error(res.error.message)
}
