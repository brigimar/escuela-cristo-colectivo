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

const VideoCatalogSourceRow = z.object({
  id: z.string().min(1),
  youtube_video_id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  thumbnail_url: z.string().nullable().optional(),
  published_at: z.string().nullable().optional(),
})

const VideoDetailSourceRow = z.object({
  id: z.string().min(1),
  youtube_video_id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  published_at: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
})

const EditorialDimensionRow = z.object({
  id: z.number().int(),
  code: z.string().min(1),
})

const EditorialTermRow = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
})

const VideoEditorialCurrentRow = z.object({
  video_id: z.string().min(1),
  dimension_id: z.number().int(),
  term_id: z.string().min(1),
})

export type VideoCatalogItem = {
  video_id: string
  title: string
  description: string
  thumbnail_url: string | null
  published_at: string | null
  category: string
  author: string
  slug: string
  url: string
}

export type VideoDetailPresentation = {
  video_id: string
  slug: string
  title: string
  description: string
  thumbnail_url: string | null
  published_at: string | null
  category: string
  content_type: string | null
  series: string | null
  author: string
  url: string
  youtube_url: string
}

export type RelatedVideoItem = {
  video_id: string
  slug: string
  title: string
  description: string
  thumbnail_url: string | null
  published_at: string | null
  category: string
  content_type: string | null
  series: string | null
  author: string
  url: string
  relation_reason: string
}

const SiteStateRow = z.object({
  is_live: z.boolean(),
  live_video_id: z.string().nullable(),
  updated_at: z.string()
})

export type SiteStateRow = z.infer<typeof SiteStateRow>

const AUTHOR_DIMENSION_CODES = new Set(["author", "speaker", "teacher", "predicador", "autor"])

function inferAuthor(title: string): string {
  const normalized = title.toLocaleLowerCase("es-AR")
  if (normalized.includes("watchman nee")) return "Watchman Nee"
  return "Escuela de Cristo"
}

function deriveVideoEditorialPresentation(params: {
  videoId: string
  slug: string
  title: string
  description: string
  thumbnail_url: string | null
  published_at: string | null
  classificationRows: z.infer<typeof VideoEditorialCurrentRow>[]
  dimensionCodeById: Map<number, string>
  termLabelById: Map<string, string>
}) {
  let category = "General"
  let contentType: string | null = null
  let series: string | null = null
  let author: string | null = null

  for (const row of params.classificationRows) {
    const code = params.dimensionCodeById.get(row.dimension_id)
    const label = params.termLabelById.get(row.term_id)
    if (!code || !label) continue
    if (code === "series_collection") series = label
    if (code === "content_type") contentType = label
    if (code === "category" && category === "General") category = label
    if (AUTHOR_DIMENSION_CODES.has(code.toLocaleLowerCase("es-AR"))) author = label
  }

  return {
    video_id: params.videoId,
    slug: params.slug,
    title: params.title,
    description: params.description,
    thumbnail_url: params.thumbnail_url,
    published_at: params.published_at,
    category: series || contentType || category,
    content_type: contentType,
    series,
    author: author || inferAuthor(params.title),
    url: `/videos/${params.slug}`,
  }
}

function mapVideoCatalogFallback(items: z.infer<typeof VideoCatalogSourceRow>[]): VideoCatalogItem[] {
  return items.map((item) => ({
    video_id: item.youtube_video_id,
    title: item.title,
    description: item.description,
    thumbnail_url: item.thumbnail_url ?? null,
    published_at: item.published_at ?? null,
    category: "General",
    author: inferAuthor(item.title),
    slug: item.slug,
    url: `/videos/${item.slug}`,
  }))
}

export async function listPublishedVisibleVideoCatalog(limit = 120): Promise<VideoCatalogItem[]> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 120

  const videosRes = await supabasePublic
    .from("videos")
    .select("id, youtube_video_id, slug, title, description, thumbnail_url, published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(safeLimit)

  if (videosRes.error) throw new Error(videosRes.error.message)
  const videos = z.array(VideoCatalogSourceRow).parse(videosRes.data).filter((item) => item.slug.trim().length > 0)
  if (videos.length === 0) return []

  const [dimensionsRes, termsRes, currentRes] = await Promise.all([
    supabasePublic.from("editorial_dimensions").select("id, code").eq("is_active", true),
    supabasePublic.from("editorial_terms").select("id, label").eq("is_active", true),
    supabasePublic
      .from("video_editorial_classification_current")
      .select("video_id, dimension_id, term_id")
      .in(
        "video_id",
        videos.map((item) => item.id)
      ),
  ])

  if (dimensionsRes.error || termsRes.error || currentRes.error) {
    return mapVideoCatalogFallback(videos)
  }

  const dimensions = z.array(EditorialDimensionRow).safeParse(dimensionsRes.data)
  const terms = z.array(EditorialTermRow).safeParse(termsRes.data)
  const current = z.array(VideoEditorialCurrentRow).safeParse(currentRes.data)
  if (!dimensions.success || !terms.success || !current.success) {
    return mapVideoCatalogFallback(videos)
  }

  const dimensionCodeById = new Map(dimensions.data.map((row) => [row.id, row.code]))
  const termLabelById = new Map(terms.data.map((row) => [row.id, row.label]))
  const rowsByVideoId = new Map<string, z.infer<typeof VideoEditorialCurrentRow>[]>()

  for (const row of current.data) {
    const existing = rowsByVideoId.get(row.video_id) ?? []
    existing.push(row)
    rowsByVideoId.set(row.video_id, existing)
  }

  const categoryPriority = ["series_collection", "content_type", "category"]
  return videos.map((item) => {
    const classificationRows = rowsByVideoId.get(item.id) ?? []

    let category = "General"
    for (const code of categoryPriority) {
      const row = classificationRows.find((entry) => dimensionCodeById.get(entry.dimension_id) === code)
      if (!row) continue
      const label = termLabelById.get(row.term_id)
      if (label) {
        category = label
        break
      }
    }

    const authorRow = classificationRows.find((entry) =>
      AUTHOR_DIMENSION_CODES.has((dimensionCodeById.get(entry.dimension_id) || "").toLocaleLowerCase("es-AR"))
    )
    const authorFromClassification = authorRow ? termLabelById.get(authorRow.term_id) ?? null : null

    return {
      video_id: item.youtube_video_id,
      title: item.title,
      description: item.description,
      thumbnail_url: item.thumbnail_url ?? null,
      published_at: item.published_at ?? null,
      category,
      author: authorFromClassification || inferAuthor(item.title),
      slug: item.slug,
      url: `/videos/${item.slug}`,
    }
  })
}

export async function getPublishedVideoDetailPresentationBySlug(slug: string): Promise<VideoDetailPresentation | null> {
  const cleanSlug = slug.trim()
  if (!cleanSlug) return null

  const videoRes = await supabasePublic
    .from("videos")
    .select("id, youtube_video_id, slug, title, description, published_at, thumbnail_url")
    .eq("slug", cleanSlug)
    .not("published_at", "is", null)
    .maybeSingle()

  if (videoRes.error) throw new Error(videoRes.error.message)
  if (!videoRes.data) return null

  const video = VideoDetailSourceRow.parse(videoRes.data)

  const [dimensionsRes, termsRes, currentRes] = await Promise.all([
    supabasePublic.from("editorial_dimensions").select("id, code").eq("is_active", true),
    supabasePublic.from("editorial_terms").select("id, label").eq("is_active", true),
    supabasePublic
      .from("video_editorial_classification_current")
      .select("dimension_id, term_id")
      .eq("video_id", video.id),
  ])

  if (!dimensionsRes.error && !termsRes.error && !currentRes.error) {
    const dimensions = z.array(EditorialDimensionRow).safeParse(dimensionsRes.data)
    const terms = z.array(EditorialTermRow).safeParse(termsRes.data)
    const current = z.array(
      z.object({
        dimension_id: z.number().int(),
        term_id: z.string().min(1),
      })
    ).safeParse(currentRes.data)

    if (dimensions.success && terms.success && current.success) {
      const detail = deriveVideoEditorialPresentation({
        videoId: video.youtube_video_id,
        slug: video.slug,
        title: video.title,
        description: video.description,
        thumbnail_url: video.thumbnail_url ?? null,
        published_at: video.published_at ?? null,
        classificationRows: current.data.map((row) => ({
          video_id: video.id,
          dimension_id: row.dimension_id,
          term_id: row.term_id,
        })),
        dimensionCodeById: new Map(dimensions.data.map((row) => [row.id, row.code])),
        termLabelById: new Map(terms.data.map((row) => [row.id, row.label])),
      })

      return {
        ...detail,
        youtube_url: `https://www.youtube.com/watch?v=${video.youtube_video_id}`,
      }
    }
  }

  return {
    video_id: video.youtube_video_id,
    slug: video.slug,
    title: video.title,
    description: video.description,
    thumbnail_url: video.thumbnail_url ?? null,
    published_at: video.published_at ?? null,
    category: "General",
    content_type: null,
    series: null,
    author: inferAuthor(video.title),
    url: `/videos/${video.slug}`,
    youtube_url: `https://www.youtube.com/watch?v=${video.youtube_video_id}`,
  }
}

export async function listRelatedPublishedVideosBySlug(slug: string, limit = 3): Promise<RelatedVideoItem[]> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 3
  const currentVideo = await getPublishedVideoDetailPresentationBySlug(slug)
  if (!currentVideo) return []

  const candidatesRes = await supabasePublic
    .from("videos")
    .select("id, youtube_video_id, slug, title, description, published_at, thumbnail_url")
    .neq("slug", currentVideo.slug)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60)

  if (candidatesRes.error) throw new Error(candidatesRes.error.message)
  const candidates = z.array(VideoDetailSourceRow.extend({ id: z.string().min(1) })).parse(candidatesRes.data)
  if (candidates.length === 0) return []

  const [dimensionsRes, termsRes, currentRes] = await Promise.all([
    supabasePublic.from("editorial_dimensions").select("id, code").eq("is_active", true),
    supabasePublic.from("editorial_terms").select("id, label").eq("is_active", true),
    supabasePublic
      .from("video_editorial_classification_current")
      .select("video_id, dimension_id, term_id")
      .in("video_id", candidates.map((item) => item.id)),
  ])

  const dimensionCodeById =
    !dimensionsRes.error && Array.isArray(dimensionsRes.data)
      ? new Map(z.array(EditorialDimensionRow).parse(dimensionsRes.data).map((row) => [row.id, row.code]))
      : new Map<number, string>()
  const termLabelById =
    !termsRes.error && Array.isArray(termsRes.data)
      ? new Map(z.array(EditorialTermRow).parse(termsRes.data).map((row) => [row.id, row.label]))
      : new Map<string, string>()
  const classificationRows =
    !currentRes.error && Array.isArray(currentRes.data)
      ? z.array(VideoEditorialCurrentRow).parse(currentRes.data)
      : []

  const rowsByVideoId = new Map<string, z.infer<typeof VideoEditorialCurrentRow>[]>()
  for (const row of classificationRows) {
    const existing = rowsByVideoId.get(row.video_id) ?? []
    existing.push(row)
    rowsByVideoId.set(row.video_id, existing)
  }

  const scored = candidates.map((candidate) => {
    const presentation = deriveVideoEditorialPresentation({
      videoId: candidate.youtube_video_id,
      slug: candidate.slug,
      title: candidate.title,
      description: candidate.description,
      thumbnail_url: candidate.thumbnail_url ?? null,
      published_at: candidate.published_at ?? null,
      classificationRows: rowsByVideoId.get(candidate.id) ?? [],
      dimensionCodeById,
      termLabelById,
    })

    let score = 0
    let relationReason = "Continuar viendo"

    if (currentVideo.series && presentation.series && currentVideo.series === presentation.series) {
      score += 100
      relationReason = `Misma serie: ${presentation.series}`
    } else if (
      currentVideo.content_type &&
      presentation.content_type &&
      currentVideo.content_type === presentation.content_type
    ) {
      score += 70
      relationReason = `Misma categoria editorial: ${presentation.content_type}`
    } else if (currentVideo.category !== "General" && currentVideo.category === presentation.category) {
      score += 55
      relationReason = `Misma categoria: ${presentation.category}`
    } else if (currentVideo.author === presentation.author) {
      score += 30
      relationReason = `Mismo autor: ${presentation.author}`
    }

    if (presentation.published_at) {
      score += new Date(presentation.published_at).getTime() / 1_000_000_000_000
    }

    return {
      ...presentation,
      relation_reason: relationReason,
      score,
    }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, safeLimit)
    .map(({ score: _score, ...item }) => item)
}

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

export async function getVideoByYoutubeId(youtube_video_id: string): Promise<VideoRow | null> {
  const res = await supabasePublic
    .from("videos")
    .select("youtube_video_id, slug, title, description, published_at, updated_at, thumbnail_url, channel_id")
    .eq("youtube_video_id", youtube_video_id)
    .maybeSingle()

  if (res.error) throw new Error(res.error.message)
  if (!res.data) return null
  return VideoRow.parse(res.data)
}

export async function getLatestVideo(): Promise<VideoRow | null> {
  const res = await supabasePublic
    .from("videos")
    .select("youtube_video_id, slug, title, description, published_at, updated_at, thumbnail_url, channel_id")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  if (res.error) throw new Error(res.error.message)
  if (!res.data) return null
  return VideoRow.parse(res.data)
}

export async function getSiteState(): Promise<SiteStateRow | null> {
  const res = await supabasePublic
    .from("site_state")
    .select("is_live, live_video_id, updated_at")
    .eq("id", true)
    .maybeSingle()

  if (res.error) throw new Error(res.error.message)
  if (!res.data) return null
  return SiteStateRow.parse(res.data)
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
