import { z } from "zod"
import { loadServerEnv } from "@/lib/env/server"
import { supabaseService } from "@/lib/supabase/client-service"
import { listUploads } from "@/lib/youtube"
import { fetchUploadsPlaylistIdForChannel } from "@/lib/youtube/client"
import { mapPlaylistItemToVideo } from "@/lib/youtube/map"
import { ingestVideoQuestions } from "@/features/questions/ingest"

const InsertRunResponse = z.object({ id: z.string().uuid() })
const ExistingVideoIdRow = z.object({ youtube_video_id: z.string().min(1) })

export type RefreshVideosResult = {
  runId: string
  status: "ok" | "error"
  fetchedCount: number
  insertedCount: number
  updatedCount: number
  questionsAttempted: number
  questionsUpserted: number
  questionsFailed: number
  questionsErrors: Array<{ youtube_video_id: string; error: string }>
  error?: string
  missingEnv?: string[]
}

type MissingEnvError = Error & { missingEnv: string[] }

function makeMissingEnvError(missingEnv: string[]): MissingEnvError {
  const err = new Error(`Missing env: ${missingEnv.join(", ")}`) as MissingEnvError
  err.missingEnv = missingEnv
  return err
}

function readMissingEnv(err: unknown): string[] | undefined {
  if (!err || typeof err !== "object") return undefined
  const maybe = err as { missingEnv?: unknown }
  if (!Array.isArray(maybe.missingEnv)) return undefined
  if (!maybe.missingEnv.every((v) => typeof v === "string")) return undefined
  return maybe.missingEnv
}

export async function refreshVideos(): Promise<RefreshVideosResult> {
  const startedAtIso = new Date().toISOString()
  const runInsert = await supabaseService
    .from("sync_runs")
    .insert({
      source: "youtube_poll",
      status: "error",
      started_at: startedAtIso,
      summary: {}
    })
    .select("id")
    .single()

  if (runInsert.error) throw new Error(runInsert.error.message)
  const { id: runId } = InsertRunResponse.parse(runInsert.data)

  let fetchedCount = 0
  let insertedCount = 0
  let updatedCount = 0
  let questionsAttempted = 0
  let questionsUpserted = 0
  let questionsFailed = 0
  const questionsErrors: Array<{ youtube_video_id: string; error: string }> = []

  try {
    const env = loadServerEnv()
    const apiKey = env.YOUTUBE_API_KEY
    const uploadsPlaylistId = env.YOUTUBE_UPLOADS_PLAYLIST_ID
    const channelIdFromEnv = env.YOUTUBE_CHANNEL_ID

    const missingEnv: string[] = []
    if (!apiKey) missingEnv.push("YOUTUBE_API_KEY")
    if (!uploadsPlaylistId && !channelIdFromEnv) missingEnv.push("YOUTUBE_UPLOADS_PLAYLIST_ID|YOUTUBE_CHANNEL_ID")
    if (missingEnv.length) throw makeMissingEnvError(missingEnv)

    if (!apiKey) throw makeMissingEnvError(["YOUTUBE_API_KEY"])
    const apiKeyValue = apiKey
    const resolvedUploadsPlaylistId =
      uploadsPlaylistId ??
      (channelIdFromEnv ? await fetchUploadsPlaylistIdForChannel(apiKeyValue, channelIdFromEnv) : null)
    if (!resolvedUploadsPlaylistId) throw new Error("Missing YOUTUBE_UPLOADS_PLAYLIST_ID or YOUTUBE_CHANNEL_ID")

    const items = await listUploads({
      apiKey: apiKeyValue,
      uploadsPlaylistId: resolvedUploadsPlaylistId,
      maxPages: 3
    })

    fetchedCount = items.length
    if (items.length === 0) {
      await supabaseService
        .from("sync_runs")
        .update({
          status: "ok",
          summary: {
            runId,
            fetchedCount: 0,
            insertedCount: 0,
            updatedCount: 0,
            questionsAttempted: 0,
            questionsUpserted: 0,
            questionsFailed: 0,
            questionsErrors: []
          }
        })
        .eq("id", runId)

      return {
        runId,
        status: "ok",
        fetchedCount: 0,
        insertedCount: 0,
        updatedCount: 0,
        questionsAttempted: 0,
        questionsUpserted: 0,
        questionsFailed: 0,
        questionsErrors: []
      }
    }

    const fallbackChannelId = items[0]?.snippet.channelId
    const channelId = channelIdFromEnv ?? fallbackChannelId
    if (!channelId) throw new Error("Missing YOUTUBE_CHANNEL_ID")

    const upserts = items.map((it) => mapPlaylistItemToVideo(it, channelId))
    const ids = upserts.map((v) => v.youtube_video_id)

    const existingRes = await supabaseService
      .from("videos")
      .select("youtube_video_id")
      .in("youtube_video_id", ids)

    if (existingRes.error) throw new Error(existingRes.error.message)

    const existingRows = z.array(ExistingVideoIdRow).parse(existingRes.data)
    const existingSet = new Set(existingRows.map((r) => r.youtube_video_id))

    const insertedDelta = ids.filter((id) => !existingSet.has(id)).length
    const updatedDelta = ids.filter((id) => existingSet.has(id)).length
    insertedCount = insertedDelta
    updatedCount = updatedDelta

    const upsertRes = await supabaseService
      .from("videos")
      .upsert(upserts, { onConflict: "youtube_video_id" })

    if (upsertRes.error) throw new Error(upsertRes.error.message)

    for (const youtubeVideoId of ids) {
      try {
        const result = await ingestVideoQuestions({
          apiKey: apiKeyValue,
          youtubeVideoId,
          maxPages: 2,
        })
        questionsAttempted += result.attempted
        questionsUpserted += result.insertedOrUpdated
      } catch (err) {
        questionsFailed += 1
        const message = err instanceof Error ? err.message : "Unknown error"
        questionsErrors.push({ youtube_video_id: youtubeVideoId, error: message })
      }
    }

    await supabaseService
      .from("sync_runs")
      .update({
        status: "ok",
        summary: {
          runId,
          fetchedCount: ids.length,
          insertedCount: insertedDelta,
          updatedCount: updatedDelta,
          questionsAttempted,
          questionsUpserted,
          questionsFailed,
          questionsErrors
        }
      })
      .eq("id", runId)

    return {
      runId,
      status: "ok",
      fetchedCount: ids.length,
      insertedCount: insertedDelta,
      updatedCount: updatedDelta,
      questionsAttempted,
      questionsUpserted,
      questionsFailed,
      questionsErrors
    }
  } catch (err) {
    const missingEnv = readMissingEnv(err)
    const message = err instanceof Error ? err.message : "Unknown error"
    await supabaseService
      .from("sync_runs")
      .update({
        status: "error",
        summary: {
          runId,
          fetchedCount,
          insertedCount,
          updatedCount,
          questionsAttempted,
          questionsUpserted,
          questionsFailed,
          questionsErrors,
          error: message,
          missingEnv
        }
      })
      .eq("id", runId)

    return {
      runId,
      status: "error",
      fetchedCount,
      insertedCount,
      updatedCount,
      questionsAttempted,
      questionsUpserted,
      questionsFailed,
      questionsErrors,
      error: message,
      missingEnv
    }
  }
}
