import { supabaseService } from "@/lib/supabase/client-service"

export type RespuestaAudio = {
  id: string
  title: string
  public_url: string | null
  created_at: string
  created_by: string | null
  mime_type: string | null
  size_bytes: number | null
  storage_bucket?: string | null
  storage_path?: string | null
  duration_seconds?: number | null
}

export async function listRespuestasAudio(limit = 50): Promise<RespuestaAudio[]> {
  try {
    const res = await supabaseService
      .from("respuestas_audio")
      .select("id, title, public_url, created_at, created_by, mime_type, size_bytes")
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(limit)

    if (res.error || !Array.isArray(res.data)) return []

    return res.data
      .map((row: any) => ({
        id: typeof row?.id === "string" ? row.id : "",
        title: typeof row?.title === "string" ? row.title : "",
        public_url: typeof row?.public_url === "string" ? row.public_url : null,
        created_at: typeof row?.created_at === "string" ? row.created_at : "",
        created_by: typeof row?.created_by === "string" ? row.created_by : null,
        mime_type: typeof row?.mime_type === "string" ? row.mime_type : null,
        size_bytes: typeof row?.size_bytes === "number" ? row.size_bytes : null,
      }))
      .filter((row) => row.id && row.title && row.created_at)
  } catch {
    return []
  }
}

function mapRespuestaAudio(row: any): RespuestaAudio {
  return {
    id: typeof row?.id === "string" ? row.id : "",
    title: typeof row?.title === "string" ? row.title : "",
    public_url: typeof row?.public_url === "string" ? row.public_url : null,
    created_at: typeof row?.created_at === "string" ? row.created_at : "",
    created_by: typeof row?.created_by === "string" ? row.created_by : null,
    mime_type: typeof row?.mime_type === "string" ? row.mime_type : null,
    size_bytes: typeof row?.size_bytes === "number" ? row.size_bytes : null,
    storage_bucket: typeof row?.storage_bucket === "string" ? row.storage_bucket : null,
    storage_path: typeof row?.storage_path === "string" ? row.storage_path : null,
    duration_seconds: typeof row?.duration_seconds === "number" ? row.duration_seconds : null,
  }
}

export async function getRespuestaAudioById(id: string): Promise<RespuestaAudio | null> {
  try {
    const res = await supabaseService
      .from("respuestas_audio")
      .select("id, title, public_url, created_at, created_by, mime_type, size_bytes, storage_bucket, storage_path, duration_seconds")
      .eq("id", id)
      .maybeSingle()

    if (res.error || !res.data) return null
    const row = mapRespuestaAudio(res.data)
    return row.id ? row : null
  } catch {
    return null
  }
}

export async function searchRespuestasAudioByTitle(query: string, limit = 10): Promise<RespuestaAudio[]> {
  const normalized = query.trim()
  if (!normalized) return []

  try {
    const res = await supabaseService
      .from("respuestas_audio")
      .select("id, title, public_url, created_at, created_by, mime_type, size_bytes, storage_bucket, storage_path, duration_seconds")
      .ilike("title", `%${normalized}%`)
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(limit)

    if (res.error || !Array.isArray(res.data)) return []
    return res.data.map(mapRespuestaAudio).filter((row) => row.id && row.title && row.created_at)
  } catch {
    return []
  }
}

export async function updateRespuestaAudioTitle(id: string, title: string): Promise<boolean> {
  const normalized = title.trim()
  if (!normalized) return false

  const res = await supabaseService
    .from("respuestas_audio")
    .update({ title: normalized })
    .eq("id", id)

  return !res.error
}

export async function saveAudioSearchPrompt(chatId: number, fromId: number): Promise<void> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "audio_search_prompt")
    .eq("is_active", true)

  const insertRes = await supabaseService
    .from("telegram_list_contexts")
    .insert({
      chat_id: chatId,
      from_id: fromId,
      context_type: "audio_search_prompt",
      category_slug: "audio_search",
      list_offset: 0,
      items: [],
      expires_at: expiresAt,
      is_active: true,
    })

  if (insertRes.error) throw new Error(insertRes.error.message)
}

export async function hasActiveAudioSearchPrompt(chatId: number, fromId: number): Promise<boolean> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .select("id")
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "audio_search_prompt")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle()

  return !res.error && Boolean(res.data?.id)
}

export async function clearAudioSearchPrompt(chatId: number, fromId: number): Promise<void> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "audio_search_prompt")
    .eq("is_active", true)

  if (res.error) throw new Error(res.error.message)
}

export async function saveAudioEditTitlePrompt(chatId: number, fromId: number, audioId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "audio_edit_title_prompt")
    .eq("is_active", true)

  const insertRes = await supabaseService
    .from("telegram_list_contexts")
    .insert({
      chat_id: chatId,
      from_id: fromId,
      context_type: "audio_edit_title_prompt",
      category_slug: "audio_edit_title",
      list_offset: 0,
      items: [{ audio_id: audioId }],
      expires_at: expiresAt,
      is_active: true,
    })

  if (insertRes.error) throw new Error(insertRes.error.message)
}

export async function getActiveAudioEditTitlePrompt(chatId: number, fromId: number): Promise<string | null> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .select("items")
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "audio_edit_title_prompt")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (res.error || !res.data || !Array.isArray(res.data.items)) return null
  const first = res.data.items[0] as Record<string, unknown> | undefined
  return typeof first?.audio_id === "string" ? first.audio_id : null
}

export async function clearAudioEditTitlePrompt(chatId: number, fromId: number): Promise<void> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "audio_edit_title_prompt")
    .eq("is_active", true)

  if (res.error) throw new Error(res.error.message)
}
