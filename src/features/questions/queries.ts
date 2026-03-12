import { supabaseService } from "@/lib/supabase/client-service"

export type AudienceQuestion = {
  id: string
  youtube_video_id?: string | null
  comment_id?: string | null
  author_name?: string | null
  text_display?: string | null
  like_count?: number | null
  published_at?: string | null
  selected_at?: string | null
  is_selected?: boolean
  is_hidden?: boolean
  selected_by?: string | null
}

export async function listSelectedAudienceQuestions(limit = 6): Promise<AudienceQuestion[]> {
  try {
    const res = await supabaseService
      .from("video_questions")
      .select("id, youtube_video_id, comment_id, author_name, text_display, like_count, published_at, selected_at")
      .eq("is_selected", true)
      .eq("is_hidden", false)
      .order("selected_at", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit)

    if (res.error || !Array.isArray(res.data)) return []

    return res.data
      .map((row: any) => ({
        id: typeof row?.id === "string" ? row.id : "",
        youtube_video_id: typeof row?.youtube_video_id === "string" ? row.youtube_video_id : null,
        comment_id: typeof row?.comment_id === "string" ? row.comment_id : null,
        author_name: typeof row?.author_name === "string" ? row.author_name : null,
        text_display: typeof row?.text_display === "string" ? row.text_display : null,
        like_count: typeof row?.like_count === "number" ? row.like_count : null,
        published_at: typeof row?.published_at === "string" ? row.published_at : null,
        selected_at: typeof row?.selected_at === "string" ? row.selected_at : null,
      }))
      .filter((row) => row.id)
  } catch {
    return []
  }
}

function mapAudienceQuestion(row: any): AudienceQuestion {
  return {
    id: typeof row?.id === "string" ? row.id : "",
    youtube_video_id: typeof row?.youtube_video_id === "string" ? row.youtube_video_id : null,
    comment_id: typeof row?.comment_id === "string" ? row.comment_id : null,
    author_name: typeof row?.author_name === "string" ? row.author_name : null,
    text_display: typeof row?.text_display === "string" ? row.text_display : null,
    like_count: typeof row?.like_count === "number" ? row.like_count : null,
    published_at: typeof row?.published_at === "string" ? row.published_at : null,
    selected_at: typeof row?.selected_at === "string" ? row.selected_at : null,
    is_selected: typeof row?.is_selected === "boolean" ? row.is_selected : false,
    is_hidden: typeof row?.is_hidden === "boolean" ? row.is_hidden : false,
    selected_by: typeof row?.selected_by === "string" ? row.selected_by : null,
  }
}

export async function listPendingAudienceQuestions(limit: number, offset: number): Promise<AudienceQuestion[]> {
  const { data, error } = await supabaseService
    .from("video_questions")
    .select("id, author_name, text_display, published_at")
    .eq("is_hidden", false)
    .eq("is_selected", false)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("listPendingAudienceQuestions error", error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: typeof row?.id === "string" ? row.id : "",
    author_name: typeof row?.author_name === "string" ? row.author_name : null,
    text_display: typeof row?.text_display === "string" ? row.text_display : null,
    published_at: typeof row?.published_at === "string" ? row.published_at : null,
  })).filter((row) => row.id)
}

export async function listSelectedAudienceQuestionsForOwner(limit = 10, offset = 0): Promise<AudienceQuestion[]> {
  try {
    const res = await supabaseService
      .from("video_questions")
      .select("id, youtube_video_id, comment_id, author_name, text_display, like_count, published_at, selected_at, is_selected, is_hidden, selected_by")
      .eq("is_selected", true)
      .eq("is_hidden", false)
      .order("selected_at", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    if (res.error || !Array.isArray(res.data)) return []
    return res.data.map(mapAudienceQuestion).filter((row) => row.id)
  } catch {
    return []
  }
}

export async function listHiddenAudienceQuestions(limit = 10, offset = 0): Promise<AudienceQuestion[]> {
  try {
    const res = await supabaseService
      .from("video_questions")
      .select("id, youtube_video_id, comment_id, author_name, text_display, like_count, published_at, selected_at, is_selected, is_hidden, selected_by")
      .eq("is_hidden", true)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    if (res.error || !Array.isArray(res.data)) return []
    return res.data.map(mapAudienceQuestion).filter((row) => row.id)
  } catch {
    return []
  }
}

export async function getAudienceQuestionById(id: string): Promise<AudienceQuestion | null> {
  try {
    const res = await supabaseService
      .from("video_questions")
      .select("id, youtube_video_id, comment_id, author_name, text_display, like_count, published_at, selected_at, is_selected, is_hidden, selected_by")
      .eq("id", id)
      .maybeSingle()

    if (res.error || !res.data) return null
    const row = mapAudienceQuestion(res.data)
    return row.id ? row : null
  } catch {
    return null
  }
}

export async function publishAudienceQuestionById(id: string, selectedBy: string): Promise<boolean> {
  const res = await supabaseService
    .from("video_questions")
    .update({
      is_selected: true,
      is_hidden: false,
      selected_at: new Date().toISOString(),
      selected_by: selectedBy,
    })
    .eq("id", id)

  return !res.error
}

export async function unpublishAudienceQuestionById(id: string): Promise<boolean> {
  const res = await supabaseService
    .from("video_questions")
    .update({
      is_selected: false,
      is_hidden: false,
      selected_at: null,
      selected_by: null,
    })
    .eq("id", id)

  return !res.error
}

export async function hideAudienceQuestionById(id: string): Promise<boolean> {
  const res = await supabaseService
    .from("video_questions")
    .update({
      is_hidden: true,
      is_selected: false,
      selected_at: null,
      selected_by: null,
    })
    .eq("id", id)

  return !res.error
}

export async function restoreAudienceQuestionById(id: string): Promise<boolean> {
  const res = await supabaseService
    .from("video_questions")
    .update({
      is_hidden: false,
      is_selected: false,
      selected_at: null,
      selected_by: null,
    })
    .eq("id", id)

  return !res.error
}

export async function selectAudienceQuestionById(id: string, selectedBy: string): Promise<boolean> {
  return publishAudienceQuestionById(id, selectedBy)
}

export async function unselectAudienceQuestionById(id: string): Promise<boolean> {
  return unpublishAudienceQuestionById(id)
}

export async function mapVideoSlugsByYoutubeId(
  youtubeIds: string[]
): Promise<Record<string, string>> {
  const ids = Array.from(new Set((youtubeIds || []).filter((id): id is string => typeof id === "string" && id.length > 0)))
  if (ids.length === 0) return {}

  try {
    const res = await supabaseService
      .from("videos")
      .select("youtube_video_id, slug")
      .in("youtube_video_id", ids)

    if (res.error || !Array.isArray(res.data)) return {}

    const map: Record<string, string> = {}
    for (const row of res.data as any[]) {
      const youtubeVideoId = typeof row?.youtube_video_id === "string" ? row.youtube_video_id : ""
      const slug = typeof row?.slug === "string" ? row.slug : ""
      if (youtubeVideoId && slug) map[youtubeVideoId] = slug
    }
    return map
  } catch {
    return {}
  }
}
