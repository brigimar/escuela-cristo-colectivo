import { fetchPlaylistItems } from "./client"

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
