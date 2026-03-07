import { z } from "zod"
import { RetryableError, withBackoff } from "./backoff"

const Thumbnail = z.object({
  url: z.string().url(),
  width: z.number().optional(),
  height: z.number().optional()
})

const PlaylistItem = z.object({
  snippet: z.object({
    title: z.string(),
    description: z.string().optional().default(""),
    channelId: z.string().optional(),
    publishedAt: z.string(),
    thumbnails: z
      .object({
        default: Thumbnail.optional(),
        medium: Thumbnail.optional(),
        high: Thumbnail.optional(),
        standard: Thumbnail.optional(),
        maxres: Thumbnail.optional()
      })
      .partial()
      .optional()
  }),
  contentDetails: z.object({
    videoId: z.string(),
    videoPublishedAt: z.string().optional()
  })
})

const PlaylistItemsResponse = z.object({
  nextPageToken: z.string().optional(),
  items: z.array(PlaylistItem)
})

const ChannelsResponse = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      contentDetails: z.object({
        relatedPlaylists: z.object({
          uploads: z.string().min(1)
        })
      })
    })
  )
})

export type YouTubePlaylistItem = z.infer<typeof PlaylistItem>

export type FetchPlaylistItemsInput = {
  apiKey: string
  playlistId: string
  pageToken?: string
  maxResults?: number
}

export async function fetchPlaylistItems(input: FetchPlaylistItemsInput) {
  const maxResults = input.maxResults ?? 50
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    maxResults: String(Math.min(50, Math.max(1, maxResults))),
    playlistId: input.playlistId,
    key: input.apiKey
  })
  if (input.pageToken) params.set("pageToken", input.pageToken)

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`

  return withBackoff(async () => {
    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
      const status = res.status
      const body = await res.text().catch(() => "")
      const msg = `YouTube API error ${status}${body ? `: ${body}` : ""}`
      if (status === 429 || status >= 500) throw new RetryableError(msg, status)
      throw new Error(msg)
    }

    const json: unknown = await res.json()
    return PlaylistItemsResponse.parse(json)
  })
}

export async function fetchUploadsPlaylistIdForChannel(apiKey: string, channelId: string) {
  const params = new URLSearchParams({
    part: "contentDetails",
    id: channelId,
    key: apiKey
  })
  const url = `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`

  return withBackoff(async () => {
    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
      const status = res.status
      const body = await res.text().catch(() => "")
      const msg = `YouTube API error ${status}${body ? `: ${body}` : ""}`
      if (status === 429 || status >= 500) throw new RetryableError(msg, status)
      throw new Error(msg)
    }

    const json: unknown = await res.json()
    const parsed = ChannelsResponse.parse(json)
    const uploads = parsed.items[0]?.contentDetails.relatedPlaylists.uploads
    if (!uploads) throw new Error("YouTube API: uploads playlist not found")
    return uploads
  })
}
