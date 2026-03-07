import fs from "node:fs"
import { randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

const APPLY_FLAG = "--apply"
const RESOLVER_VERSION = "v1"
const CONTENT_TYPE_DIMENSION = "content_type"
const SERIES_COLLECTION_DIMENSION = "series_collection"

function loadEnvFile(path) {
  const text = fs.readFileSync(path, "utf8")
  const out = {}

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const idx = line.indexOf("=")
    if (idx < 0) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1)
    out[key] = value
  }

  return out
}

function chunk(items, size) {
  const out = []
  for (let idx = 0; idx < items.length; idx += size) {
    out.push(items.slice(idx, idx + size))
  }
  return out
}

function normalizeTitle(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
}

function titleIncludesAny(normalizedTitle, patterns) {
  return patterns.some((pattern) => normalizedTitle.includes(pattern))
}

function resolveContentTypeFromTitle(title) {
  const normalized = normalizeTitle(title)
  const trimmed = title.trim()

  if (titleIncludesAny(normalized, ["#SHORTS", "#SHORTSVIDEO", "#VIRALSHORTS"])) {
    return { slug: "short", sourceRef: "title:#shorts" }
  }

  if (titleIncludesAny(normalized, ["CORTES LIVE", "CORTE LIVE"])) {
    return { slug: "clip", sourceRef: "title:cortes_live" }
  }

  if (
    titleIncludesAny(normalized, ["LIVE", "EN VIVO", "TRANSMISION EN VIVO", "ESTA EN VIVO"]) ||
    trimmed.startsWith("🔴")
  ) {
    return { slug: "live", sourceRef: "title:live" }
  }

  if (titleIncludesAny(normalized, ["EL CLUB DEL LIBRO"])) {
    return { slug: "book_club", sourceRef: "title:club_del_libro" }
  }

  if (titleIncludesAny(normalized, ["AUDIOLIBRO"])) {
    return { slug: "audiobook", sourceRef: "title:audiolibro" }
  }

  if (titleIncludesAny(normalized, ["DESAFIO M28"])) {
    return { slug: "series_episode", sourceRef: "title:desafio_m28" }
  }

  if (titleIncludesAny(normalized, ["REFLEXIONES CORTAS"])) {
    return { slug: "reflection", sourceRef: "title:reflexiones_cortas" }
  }

  return { slug: "teaching", sourceRef: "fallback:teaching", fallback: true }
}

function resolveSeriesCollectionFromTitle(title) {
  const normalized = normalizeTitle(title)

  if (titleIncludesAny(normalized, ["DESAFIO M28"])) {
    return { slug: "desafio_m28", sourceRef: "title:desafio_m28" }
  }

  if (titleIncludesAny(normalized, ["WATCHMAN NEE"])) {
    return { slug: "watchman_nee", sourceRef: "title:watchman_nee" }
  }

  if (titleIncludesAny(normalized, ["REFLEXIONES CORTAS"])) {
    return { slug: "reflexiones_cortas", sourceRef: "title:reflexiones_cortas" }
  }

  if (titleIncludesAny(normalized, ["EL CLUB DEL LIBRO"])) {
    return { slug: "club_del_libro", sourceRef: "title:club_del_libro" }
  }

  if (titleIncludesAny(normalized, ["ORACIONES APOSTOLICAS"])) {
    return { slug: "oraciones_apostolicas", sourceRef: "title:oraciones_apostolicas" }
  }

  if (titleIncludesAny(normalized, ["CORTES LIVE", "CORTE LIVE"])) {
    return { slug: "cortes_live", sourceRef: "title:cortes_live" }
  }

  if (titleIncludesAny(normalized, ["LIVE 1/4", "LIVE 2/4", "LIVE 3/4", "LIVE 4/4"])) {
    return { slug: "lives_espiritu_santo", sourceRef: "title:lives_espiritu_santo" }
  }

  if (titleIncludesAny(normalized, ["HECHOS"])) {
    return { slug: "hechos", sourceRef: "title:hechos" }
  }

  if (titleIncludesAny(normalized, ["MATEO"])) {
    return { slug: "mateo", sourceRef: "title:mateo" }
  }

  return null
}

function sameCurrent(a, b) {
  if (!a || !b) return false
  return (
    a.term_id === b.term_id &&
    a.source_kind === b.source_kind &&
    (a.source_ref || null) === (b.source_ref || null) &&
    Number(a.confidence) === Number(b.confidence) &&
    a.resolver_version === b.resolver_version
  )
}

function requireValue(value, label) {
  if (!value) throw new Error(`Missing ${label}`)
  return value
}

function expectSingleMatch(collection, predicate, label) {
  const match = collection.find(predicate)
  if (!match) throw new Error(`Missing ${label}`)
  return match
}

function emptySourceCounts() {
  return {
    manual: 0,
    title_rule: 0,
    fallback: 0
  }
}

function incrementCounter(target, key) {
  target[key] = (target[key] || 0) + 1
}

function incrementSlugCounter(target, slug) {
  target[slug] = (target[slug] || 0) + 1
}

async function fetchAllVideos(supabase) {
  const pageSize = 200
  let from = 0
  const out = []

  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from("videos")
      .select("id,title")
      .order("created_at", { ascending: true })
      .range(from, to)

    if (error) throw new Error(`videos: ${error.message}`)
    if (!data || data.length === 0) break

    out.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }

  return out
}

async function main() {
  const shouldApply = process.argv.includes(APPLY_FLAG)
  const runKey = `editorial_v1_${new Date().toISOString()}_${randomUUID()}`

  const env = loadEnvFile(".env.local")
  const url = requireValue(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL, "SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL")
  const key = requireValue(env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY")
  const supabase = createClient(url, key)

  const [{ data: dimensions, error: dimensionsError }, { data: terms, error: termsError }] =
    await Promise.all([
      supabase.from("editorial_dimensions").select("id,code,is_required"),
      supabase.from("editorial_terms").select("id,dimension_id,slug,is_active")
    ])

  if (dimensionsError) throw new Error(`editorial_dimensions: ${dimensionsError.message}`)
  if (termsError) throw new Error(`editorial_terms: ${termsError.message}`)

  const contentTypeDimension = expectSingleMatch(
    dimensions || [],
    (row) => row.code === CONTENT_TYPE_DIMENSION,
    `dimension ${CONTENT_TYPE_DIMENSION}`
  )
  const seriesCollectionDimension = expectSingleMatch(
    dimensions || [],
    (row) => row.code === SERIES_COLLECTION_DIMENSION,
    `dimension ${SERIES_COLLECTION_DIMENSION}`
  )

  const activeTerms = (terms || []).filter((row) => row.is_active)
  const termByDimensionSlug = new Map(
    activeTerms.map((row) => [`${row.dimension_id}:${row.slug}`, row])
  )

  const requiredTermKeys = [
    "short",
    "clip",
    "live",
    "book_club",
    "audiobook",
    "series_episode",
    "reflection",
    "teaching"
  ].map((slug) => `${contentTypeDimension.id}:${slug}`)

  const requiredSeriesKeys = [
    "desafio_m28",
    "watchman_nee",
    "reflexiones_cortas",
    "club_del_libro",
    "oraciones_apostolicas",
    "cortes_live",
    "lives_espiritu_santo",
    "hechos",
    "mateo"
  ].map((slug) => `${seriesCollectionDimension.id}:${slug}`)

  for (const keyName of [...requiredTermKeys, ...requiredSeriesKeys]) {
    if (!termByDimensionSlug.has(keyName)) throw new Error(`Missing editorial term ${keyName}`)
  }

  const [videos, overridesRes, currentRes] = await Promise.all([
    fetchAllVideos(supabase),
    supabase
      .from("video_editorial_overrides")
      .select("video_id,dimension_id,term_id,set_by,is_active")
      .eq("is_active", true),
    supabase
      .from("video_editorial_classification_current")
      .select("video_id,dimension_id,term_id,source_kind,source_ref,confidence,resolver_version")
      .in("dimension_id", [contentTypeDimension.id, seriesCollectionDimension.id])
  ])

  if (overridesRes.error) throw new Error(`video_editorial_overrides: ${overridesRes.error.message}`)
  if (currentRes.error) throw new Error(`video_editorial_classification_current: ${currentRes.error.message}`)

  const overrideByVideoDimension = new Map(
    (overridesRes.data || []).map((row) => [`${row.video_id}:${row.dimension_id}`, row])
  )
  const currentByVideoDimension = new Map(
    (currentRes.data || []).map((row) => [`${row.video_id}:${row.dimension_id}`, row])
  )

  const currentRows = []
  const logRows = []
  const staleSeriesVideoIds = []

  const sourceCounts = {
    content_type: emptySourceCounts(),
    series_collection: emptySourceCounts()
  }
  const slugCounts = {
    content_type: {},
    series_collection: {}
  }

  for (const video of videos) {
    const title = typeof video.title === "string" ? video.title : ""

    const contentTypeOverride = overrideByVideoDimension.get(`${video.id}:${contentTypeDimension.id}`)
    if (contentTypeOverride) {
      const manualTerm = expectSingleMatch(
        activeTerms,
        (row) => row.dimension_id === contentTypeDimension.id && row.id === contentTypeOverride.term_id,
        `term ${contentTypeOverride.term_id}`
      )
      const row = {
        video_id: video.id,
        dimension_id: contentTypeDimension.id,
        term_id: contentTypeOverride.term_id,
        source_kind: "manual",
        source_ref: `override:${contentTypeOverride.set_by}`,
        confidence: 1.0,
        resolved_at: new Date().toISOString(),
        resolver_version: RESOLVER_VERSION
      }
      const prev = currentByVideoDimension.get(`${video.id}:${contentTypeDimension.id}`)
      const changed = !sameCurrent(prev, row)
      currentRows.push(row)
      logRows.push({
        id: randomUUID(),
        video_id: row.video_id,
        dimension_id: row.dimension_id,
        term_id: row.term_id,
        source_kind: row.source_kind,
        source_ref: row.source_ref,
        confidence: row.confidence,
        resolver_version: row.resolver_version,
        evaluated_at: row.resolved_at,
        run_key: runKey,
        changed
      })
      incrementCounter(sourceCounts.content_type, "manual")
      incrementSlugCounter(slugCounts.content_type, manualTerm.slug)
    } else {
      const resolved = resolveContentTypeFromTitle(title)
      const term = termByDimensionSlug.get(`${contentTypeDimension.id}:${resolved.slug}`)
      const row = {
        video_id: video.id,
        dimension_id: contentTypeDimension.id,
        term_id: term.id,
        source_kind: resolved.fallback ? "fallback" : "title_rule",
        source_ref: resolved.sourceRef,
        confidence: resolved.fallback ? 0.3 : 0.75,
        resolved_at: new Date().toISOString(),
        resolver_version: RESOLVER_VERSION
      }
      const prev = currentByVideoDimension.get(`${video.id}:${contentTypeDimension.id}`)
      const changed = !sameCurrent(prev, row)
      currentRows.push(row)
      logRows.push({
        id: randomUUID(),
        video_id: row.video_id,
        dimension_id: row.dimension_id,
        term_id: row.term_id,
        source_kind: row.source_kind,
        source_ref: row.source_ref,
        confidence: row.confidence,
        resolver_version: row.resolver_version,
        evaluated_at: row.resolved_at,
        run_key: runKey,
        changed
      })
      incrementCounter(sourceCounts.content_type, row.source_kind)
      incrementSlugCounter(slugCounts.content_type, resolved.slug)
    }

    const seriesOverride = overrideByVideoDimension.get(`${video.id}:${seriesCollectionDimension.id}`)
    if (seriesOverride) {
      const manualTerm = expectSingleMatch(
        activeTerms,
        (row) => row.dimension_id === seriesCollectionDimension.id && row.id === seriesOverride.term_id,
        `term ${seriesOverride.term_id}`
      )
      const row = {
        video_id: video.id,
        dimension_id: seriesCollectionDimension.id,
        term_id: seriesOverride.term_id,
        source_kind: "manual",
        source_ref: `override:${seriesOverride.set_by}`,
        confidence: 1.0,
        resolved_at: new Date().toISOString(),
        resolver_version: RESOLVER_VERSION
      }
      const prev = currentByVideoDimension.get(`${video.id}:${seriesCollectionDimension.id}`)
      const changed = !sameCurrent(prev, row)
      currentRows.push(row)
      logRows.push({
        id: randomUUID(),
        video_id: row.video_id,
        dimension_id: row.dimension_id,
        term_id: row.term_id,
        source_kind: row.source_kind,
        source_ref: row.source_ref,
        confidence: row.confidence,
        resolver_version: row.resolver_version,
        evaluated_at: row.resolved_at,
        run_key: runKey,
        changed
      })
      incrementCounter(sourceCounts.series_collection, "manual")
      incrementSlugCounter(slugCounts.series_collection, manualTerm.slug)
      continue
    }

    const resolvedSeries = resolveSeriesCollectionFromTitle(title)
    if (resolvedSeries) {
      const term = termByDimensionSlug.get(`${seriesCollectionDimension.id}:${resolvedSeries.slug}`)
      const row = {
        video_id: video.id,
        dimension_id: seriesCollectionDimension.id,
        term_id: term.id,
        source_kind: "title_rule",
        source_ref: resolvedSeries.sourceRef,
        confidence: 0.75,
        resolved_at: new Date().toISOString(),
        resolver_version: RESOLVER_VERSION
      }
      const prev = currentByVideoDimension.get(`${video.id}:${seriesCollectionDimension.id}`)
      const changed = !sameCurrent(prev, row)
      currentRows.push(row)
      logRows.push({
        id: randomUUID(),
        video_id: row.video_id,
        dimension_id: row.dimension_id,
        term_id: row.term_id,
        source_kind: row.source_kind,
        source_ref: row.source_ref,
        confidence: row.confidence,
        resolver_version: row.resolver_version,
        evaluated_at: row.resolved_at,
        run_key: runKey,
        changed
      })
      incrementCounter(sourceCounts.series_collection, "title_rule")
      incrementSlugCounter(slugCounts.series_collection, resolvedSeries.slug)
    } else if (currentByVideoDimension.has(`${video.id}:${seriesCollectionDimension.id}`)) {
      staleSeriesVideoIds.push(video.id)
    }
  }

  const summary = {
    run_key: runKey,
    apply: shouldApply,
    total_videos: videos.length,
    rows: {
      current_upserts: currentRows.length,
      log_inserts: logRows.length,
      stale_series_deletes: staleSeriesVideoIds.length
    },
    source_counts: sourceCounts,
    slug_counts: slugCounts
  }

  if (!shouldApply) {
    console.log(JSON.stringify(summary, null, 2))
    console.log("Dry run only. Re-run with --apply to write changes.")
    return
  }

  for (const batch of chunk(currentRows, 200)) {
    const { error } = await supabase
      .from("video_editorial_classification_current")
      .upsert(batch, { onConflict: "video_id,dimension_id" })

    if (error) throw new Error(`upsert current: ${error.message}`)
  }

  for (const batch of chunk(logRows, 200)) {
    const { error } = await supabase
      .from("video_editorial_classification_log")
      .insert(batch)

    if (error) throw new Error(`insert log: ${error.message}`)
  }

  for (const batch of chunk(staleSeriesVideoIds, 200)) {
    const { error } = await supabase
      .from("video_editorial_classification_current")
      .delete()
      .eq("dimension_id", seriesCollectionDimension.id)
      .in("video_id", batch)

    if (error) throw new Error(`delete stale series_collection: ${error.message}`)
  }

  console.log(JSON.stringify(summary, null, 2))
  console.log("Backfill applied.")
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
})
