import { slugify } from "../text/slug"
import type { YouTubePlaylistItem } from "./client"

export type VideoUpsert = {
  youtube_video_id: string
  slug: string
  title: string
  description: string
  published_at: string | null
  thumbnail_url: string | null
  channel_id: string
  raw: YouTubePlaylistItem
}

function pickThumbnailUrl(item: YouTubePlaylistItem): string | null {
  const t = item.snippet.thumbnails
  return t?.maxres?.url ?? t?.standard?.url ?? t?.high?.url ?? t?.medium?.url ?? t?.default?.url ?? null
}

export function makeVideoSlug(title: string, youtubeVideoId: string) {
  const base = slugify(title).slice(0, 80).replace(/-+$/g, "")
  return `${base || "video"}-${youtubeVideoId}`
}

export function mapPlaylistItemToVideo(item: YouTubePlaylistItem, channelId: string): VideoUpsert {
  const youtubeVideoId = item.contentDetails.videoId
  const title = item.snippet.title
  return {
    youtube_video_id: youtubeVideoId,
    slug: makeVideoSlug(title, youtubeVideoId),
    title,
    description: item.snippet.description ?? "",
    published_at: item.contentDetails.videoPublishedAt ?? item.snippet.publishedAt ?? null,
    thumbnail_url: pickThumbnailUrl(item),
    channel_id: channelId || item.snippet.channelId || "",
    raw: item
  }
}
