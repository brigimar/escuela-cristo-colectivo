import { supabaseService } from "@/lib/supabase/client-service"

export type RecommendedVideo = {
  youtube_video_id: string | null
  slug: string | null
  title: string | null
  thumbnail_url: string | null
  published_at: string | null
}

type SetRecommendationResult =
  | { ok: true }
  | { ok: false; reason: "not_found_in_videos" }

export async function getVideoRecommendation(): Promise<RecommendedVideo | null> {
  try {
    const res = await supabaseService
      .from("video_recommendation")
      .select("youtube_video_id, slug, title, thumbnail_url, published_at")
      .eq("id", 1)
      .maybeSingle()

    if (res.error || !res.data) return null

    let youtube_video_id = typeof res.data.youtube_video_id === "string" ? res.data.youtube_video_id : null
    let slug = typeof res.data.slug === "string" ? res.data.slug : null
    let title = typeof res.data.title === "string" ? res.data.title : null
    let thumbnail_url = typeof res.data.thumbnail_url === "string" ? res.data.thumbnail_url : null
    let published_at = typeof res.data.published_at === "string" ? res.data.published_at : null

    if (youtube_video_id && (!slug || !title || !thumbnail_url || !published_at)) {
      const lookup = await supabaseService
        .from("videos")
        .select("slug, title, thumbnail_url, published_at")
        .eq("youtube_video_id", youtube_video_id)
        .maybeSingle()

      if (!lookup.error && lookup.data) {
        slug = slug ?? (typeof lookup.data.slug === "string" ? lookup.data.slug : null)
        title = title ?? (typeof lookup.data.title === "string" ? lookup.data.title : null)
        thumbnail_url = thumbnail_url ?? (typeof lookup.data.thumbnail_url === "string" ? lookup.data.thumbnail_url : null)
        published_at = published_at ?? (typeof lookup.data.published_at === "string" ? lookup.data.published_at : null)
      }
    }

    if (!youtube_video_id && !slug && !title && !thumbnail_url && !published_at) return null

    return { youtube_video_id, slug, title, thumbnail_url, published_at }
  } catch {
    return null
  }
}

export async function setVideoRecommendationByYoutubeId(
  youtubeVideoId: string,
  setBy: string
): Promise<SetRecommendationResult> {
  try {
    const video = await supabaseService
      .from("videos")
      .select("youtube_video_id, slug, title, thumbnail_url, published_at")
      .eq("youtube_video_id", youtubeVideoId)
      .maybeSingle()

    if (video.error || !video.data) return { ok: false, reason: "not_found_in_videos" }

    const updateRes = await supabaseService
      .from("video_recommendation")
      .update({
        youtube_video_id: video.data.youtube_video_id ?? null,
        slug: video.data.slug ?? null,
        title: video.data.title ?? null,
        thumbnail_url: video.data.thumbnail_url ?? null,
        published_at: video.data.published_at ?? null,
        set_by: setBy,
        set_at: new Date().toISOString(),
      })
      .eq("id", 1)

    if (updateRes.error) return { ok: false, reason: "not_found_in_videos" }

    return { ok: true }
  } catch {
    return { ok: false, reason: "not_found_in_videos" }
  }
}

