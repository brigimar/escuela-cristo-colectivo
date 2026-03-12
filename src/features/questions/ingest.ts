import { supabaseService } from "@/lib/supabase/client-service"
import { fetchCommentThreadsByVideoId } from "@/lib/youtube"

type IngestQuestionResult = {
  attempted: number
  insertedOrUpdated: number
}

const QUESTION_PREFIXES = ["pregunta", "consulta", "duda"]

export function isQuestionText(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  if (!normalized) return false
  if (normalized.includes("?")) return true
  return QUESTION_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

export async function ingestVideoQuestions(params: {
  apiKey: string
  youtubeVideoId: string
  maxPages?: number
}): Promise<IngestQuestionResult> {
  const threads = await fetchCommentThreadsByVideoId({
    apiKey: params.apiKey,
    videoId: params.youtubeVideoId,
    maxPages: params.maxPages ?? 2,
  })

  const rows = threads
    .map((thread) => {
      const top = thread.snippet?.topLevelComment
      const comment = top?.snippet
      const commentId = typeof top?.id === "string" ? top.id : ""
      const text = typeof comment?.textDisplay === "string" ? comment.textDisplay : ""
      if (!commentId || !text || !isQuestionText(text)) return null

      return {
        youtube_video_id: params.youtubeVideoId,
        comment_id: commentId,
        author_name: typeof comment?.authorDisplayName === "string" ? comment.authorDisplayName : null,
        author_channel_id: typeof comment?.authorChannelId?.value === "string" ? comment.authorChannelId.value : null,
        text_display: text,
        like_count: typeof comment?.likeCount === "number" ? comment.likeCount : 0,
        published_at: typeof comment?.publishedAt === "string" ? comment.publishedAt : null,
        fetched_at: new Date().toISOString(),
        is_selected: false,
        is_hidden: false,
        raw: thread,
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  if (rows.length === 0) {
    return { attempted: threads.length, insertedOrUpdated: 0 }
  }

  const upsert = await supabaseService
    .from("video_questions")
    .upsert(rows, { onConflict: "comment_id" })

  if (upsert.error) {
    throw new Error(upsert.error.message)
  }

  return { attempted: threads.length, insertedOrUpdated: rows.length }
}
