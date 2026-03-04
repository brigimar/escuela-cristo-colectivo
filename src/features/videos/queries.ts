import { z } from "zod"
import { supabasePublic } from "@/lib/supabase/client-public"

const VideoRow = z.object({
  youtube_video_id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  published_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
  channel_id: z.string().min(1).optional()
})

export type VideoRow = z.infer<typeof VideoRow>

export async function listVideos(): Promise<VideoRow[]> {
  const res = await supabasePublic
    .from("videos")
    .select("youtube_video_id, slug, title, description, published_at, updated_at, thumbnail_url, channel_id")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(50)

  if (res.error) throw new Error(res.error.message)
  return z.array(VideoRow).parse(res.data)
}

export async function getVideoBySlug(slug: string): Promise<VideoRow | null> {
  const res = await supabasePublic
    .from("videos")
    .select("youtube_video_id, slug, title, description, published_at, updated_at, thumbnail_url, channel_id")
    .eq("slug", slug)
    .maybeSingle()

  if (res.error) throw new Error(res.error.message)
  if (!res.data) return null
  return VideoRow.parse(res.data)
}

export type VideoSitemapEntry = {
  slug: string
  published_at?: string | null | undefined
  updated_at?: string | null | undefined
}

const VideoSitemapEntrySchema = z.object({
  slug: z.string().min(1),
  published_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional()
})

export async function listAllVideoSitemapEntries(): Promise<VideoSitemapEntry[]> {
  const pageSize = 1000
  const out: VideoSitemapEntry[] = []

  for (let offset = 0; offset < 50_000; offset += pageSize) {
    const res = await supabasePublic
      .from("videos")
      .select("slug, published_at, updated_at")
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + pageSize - 1)

    if (res.error) throw new Error(res.error.message)
    const page = z.array(VideoSitemapEntrySchema).parse(res.data)
    out.push(...page)
    if (page.length < pageSize) break
  }

  return out
}

export async function listVideosForRss(limit = 50): Promise<VideoRow[]> {
  const res = await supabasePublic
    .from("videos")
    .select("youtube_video_id, slug, title, description, published_at, updated_at, thumbnail_url")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (res.error) throw new Error(res.error.message)
  return z.array(VideoRow).parse(res.data)
}
