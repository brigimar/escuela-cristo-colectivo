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
