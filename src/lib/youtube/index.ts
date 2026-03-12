import { fetchCommentThreads, fetchPlaylistItems, type YouTubeCommentThread } from "./client"

export type ListUploadsInput = {
  apiKey: string
  uploadsPlaylistId: string
  maxPages?: number
}

export async function listUploads(input: ListUploadsInput) {
  const maxPages = input.maxPages ?? 3
  const items: Awaited<ReturnType<typeof fetchPlaylistItems>>["items"] = []

  let pageToken: string | undefined
  for (let page = 0; page < maxPages; page += 1) {
    const res = await fetchPlaylistItems({
      apiKey: input.apiKey,
      playlistId: input.uploadsPlaylistId,
      pageToken,
      maxResults: 50
    })
    items.push(...res.items)
    if (!res.nextPageToken) break
    pageToken = res.nextPageToken
  }

  return items
}

export async function fetchCommentThreadsByVideoId(input: {
  apiKey: string
  videoId: string
  maxPages?: number
  textFormat?: "plainText" | "html"
}): Promise<YouTubeCommentThread[]> {
  const maxPages = input.maxPages ?? 2
  const items: YouTubeCommentThread[] = []
  let pageToken: string | undefined
  let page = 0

  do {
    const res = await fetchCommentThreads({
      apiKey: input.apiKey,
      videoId: input.videoId,
      pageToken,
      textFormat: input.textFormat ?? "plainText",
    })
    items.push(...res.items)
    pageToken = res.nextPageToken
    page += 1
  } while (pageToken && page < maxPages)

  return items
}
