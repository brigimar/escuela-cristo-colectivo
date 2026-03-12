import { revalidatePath } from "next/cache"
import { loadServerEnv } from "@/lib/env/server"
import { getVideoRecommendation, setVideoRecommendationByYoutubeId } from "@/features/recommendation/queries"
import {
  clearAudioEditTitlePrompt,
  clearAudioSearchPrompt,
  getActiveAudioEditTitlePrompt,
  getRespuestaAudioById,
  hasActiveAudioSearchPrompt,
  listRespuestasAudio,
  saveAudioEditTitlePrompt,
  saveAudioSearchPrompt,
  searchRespuestasAudioByTitle,
  updateRespuestaAudioTitle,
} from "@/features/audio/queries"
import {
  clearReadingEditorContext,
  getDailyReadingCurrent,
  getReadingEditorContext,
  publishDailyReadingCurrent,
  saveReadingEditorContext,
} from "@/features/reading/queries"
import {
  createLibraryPdf,
  clearPdfEditorContext,
  getPdfEditorContext,
  getLibraryPdfById,
  listLibraryPdfsByVisibility,
  savePdfEditorContext,
  setLibraryPdfPublished,
  updateLibraryPdfMetadata,
} from "@/features/library/queries"
import {
  getAudienceQuestionById,
  hideAudienceQuestionById,
  listHiddenAudienceQuestions,
  listPendingAudienceQuestions,
  listSelectedAudienceQuestionsForOwner,
  restoreAudienceQuestionById,
  selectAudienceQuestionById,
} from "@/features/questions/queries"
import {
  clearVideoSearchPrompt,
  getActiveTelegramEditorialListContext,
  getTelegramEditorialCategory,
  getVideoEditorialDetailByYoutubeId,
  getVideoSummaryByYoutubeId,
  hasActiveVideoSearchPrompt,
  listLatestVideoSummaries,
  listVideoEditorialClassificationByYoutubeId,
  listVideosByTelegramEditorialCategory,
  listVideosWithoutSeriesCollection,
  saveVideoSearchPrompt,
  saveTelegramEditorialListContext,
  searchVideoSummariesByTitle,
} from "@/features/videos/editorial-queries"
import { supabaseService } from "@/lib/supabase/client-service"
import {
  buildOwnerHelpText,
  buildOwnerMainMenuText,
  buildOwnerAudioAwaitingFileText,
  buildOwnerAudioAwaitingTitleText,
  buildOwnerAudioConfirmText,
  buildOwnerAudioText,
  buildOwnerAnswerDetailKeyboard,
  buildOwnerAnswerListKeyboard,
  buildOwnerAnswersSearchText,
  buildOwnerAnswersText,
  buildOwnerPdfDraftEditorKeyboard,
  buildOwnerPdfDraftEditorText,
  buildOwnerPdfAwaitingFileText,
  buildOwnerPdfDetailKeyboard,
  buildOwnerPdfListKeyboard,
  buildOwnerPdfsText,
  buildOwnerReadingEditorKeyboard,
  buildOwnerReadingEditorText,
  buildOwnerReadingText,
  buildOwnerQuestionDetailKeyboard,
  buildOwnerQuestionListKeyboard,
  buildOwnerQuestionsText,
  buildOwnerRecommendCategoriesKeyboard,
  buildOwnerVideoClassificationKeyboard,
  buildOwnerVideoDetailKeyboard,
  buildOwnerVideoListKeyboard,
  buildOwnerRecommendConfirmKeyboard,
  buildOwnerRecommendCurrentKeyboard,
  buildOwnerRecommendMenuText,
  buildOwnerStatusText,
  buildOwnerRecommendVideoListKeyboard,
  buildOwnerVideosSearchText,
  buildOwnerVideosText,
  OWNER_AUDIO_AWAITING_FILE_BUTTONS,
  OWNER_AUDIO_CONFIRM_BUTTONS,
  OWNER_AUDIO_MENU_BUTTONS,
  OWNER_ANSWERS_MENU_BUTTONS,
  OWNER_HELP_MENU_BUTTONS,
  OWNER_MAIN_MENU_BUTTONS,
  OWNER_PDF_AWAITING_FILE_BUTTONS,
  OWNER_PDFS_MENU_BUTTONS,
  OWNER_QUESTIONS_MENU_BUTTONS,
  OWNER_READING_MENU_BUTTONS,
  OWNER_RECOMMEND_MENU_BUTTONS,
  OWNER_STATUS_MENU_BUTTONS,
  OWNER_VIDEOS_MENU_BUTTONS,
} from "@/lib/telegram/owner-menu"

type TelegramMessage = {
  message_id?: number
  chat?: { id?: number }
  from?: { id?: number; username?: string }
  text?: string
  voice?: { file_id?: string; file_unique_id?: string; mime_type?: string; file_size?: number }
  audio?: { file_id?: string; file_unique_id?: string; mime_type?: string; file_size?: number }
  document?: { file_id?: string; file_unique_id?: string; mime_type?: string; file_size?: number; file_name?: string }
}

type TelegramCallbackQuery = {
  id?: string
  data?: string
  from?: { id?: number; username?: string }
  message?: TelegramMessage
}

type TelegramUpdate = {
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

type TelegramReplyMarkup =
  | { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> }
  | { remove_keyboard: true }

async function callTelegram(method: string, payload: Record<string, unknown>) {
  const { TELEGRAM_BOT_TOKEN } = loadServerEnv()
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN")
  }

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Telegram ${method} failed: ${res.status} ${body}`)
  }
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: TelegramReplyMarkup) {
  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  })
}

async function editTelegramMessage(chatId: number, messageId: number, text: string, replyMarkup?: TelegramReplyMarkup) {
  await callTelegram("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: replyMarkup,
  })
}

async function answerTelegramCallbackQuery(callbackQueryId: string, text?: string) {
  await callTelegram("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  })
}

async function sendOrEditTelegramMessage(
  params: { chatId: number; text: string; replyMarkup?: TelegramReplyMarkup; messageId?: number | null }
) {
  if (typeof params.messageId === "number") {
    await editTelegramMessage(params.chatId, params.messageId, params.text, params.replyMarkup)
    return
  }

  await sendTelegramMessage(params.chatId, params.text, params.replyMarkup)
}

function formatTelegramDate(value: string | null) {
  return value ? value.slice(0, 10) : "—"
}

function buildVideoListText(title: string, videos: Array<{ title: string; published_at: string | null; youtube_video_id: string }>) {
  return `${title}\n\n${videos
    .map((video, index) => `${index + 1}. ${video.title}\n${formatTelegramDate(video.published_at)}\nID: ${video.youtube_video_id}`)
    .join("\n\n")}`
}

function buildQuestionListText(
  title: string,
  questions: Array<{ author_name?: string | null; text_display?: string | null; published_at?: string | null; comment_id?: string | null }>
) {
  return `${title}\n\n${questions
    .map(
      (question, index) =>
        `${index + 1}. ${question.author_name || "Anonimo"}\n${question.text_display || "Sin texto"}\n${formatTelegramDate(question.published_at || null)}\nComment ID: ${question.comment_id || "—"}`
    )
    .join("\n\n")}`
}

function buildAnswerListText(title: string, answers: Array<{ title: string; created_at: string; created_by: string | null }>) {
  return `${title}\n\n${answers
    .map((answer, index) => `${index + 1}. ${answer.title}\n${formatTelegramDate(answer.created_at)}\n${answer.created_by || "—"}`)
    .join("\n\n")}`
}

function trimForTelegram(value: string | null | undefined, max = 800) {
  const text = (value || "").trim()
  if (!text) return "—"
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function parsePdfBackCallback(value: string | null | undefined): "owner:pdfs:published" | "owner:pdfs:hidden" | "owner:pdfs" {
  if (value === "owner:pdfs:published" || value === "owner:pdfs:hidden" || value === "owner:pdfs") return value
  return "owner:pdfs"
}

async function renderPdfDraftEditor(params: {
  chatId: number
  messageId?: number | null
  fromId: number
}) {
  const pendingPdf = await supabaseService
    .from("telegram_pending_pdf")
    .select("file_id, draft_title, draft_description, draft_author, awaiting_field")
    .eq("chat_id", params.chatId)
    .eq("from_id", params.fromId)
    .maybeSingle()

  if (pendingPdf.error || !pendingPdf.data) {
    await sendOrEditTelegramMessage({
      chatId: params.chatId,
      messageId: params.messageId,
      text: "No hay borrador activo. Usa 'Subir nuevo PDF'.",
      replyMarkup: OWNER_PDFS_MENU_BUTTONS,
    })
    return
  }

  const awaitingField =
    pendingPdf.data.awaiting_field === "title" ||
    pendingPdf.data.awaiting_field === "description" ||
    pendingPdf.data.awaiting_field === "author"
      ? pendingPdf.data.awaiting_field
      : null

  await sendOrEditTelegramMessage({
    chatId: params.chatId,
    messageId: params.messageId,
    text: buildOwnerPdfDraftEditorText({
      hasFile: Boolean(pendingPdf.data.file_id),
      title: pendingPdf.data.draft_title || "",
      description: pendingPdf.data.draft_description || "",
      author: pendingPdf.data.draft_author || "",
      awaitingField,
    }),
    replyMarkup: buildOwnerPdfDraftEditorKeyboard(),
  })
}

async function renderPdfDetail(params: {
  chatId: number
  messageId?: number | null
  pdfId: string
  backCallback: "owner:pdfs:published" | "owner:pdfs:hidden" | "owner:pdfs"
}) {
  const item = await getLibraryPdfById(params.pdfId)
  if (!item) {
    await sendOrEditTelegramMessage({
      chatId: params.chatId,
      messageId: params.messageId,
      text: "No pude cargar ese PDF.",
      replyMarkup: OWNER_PDFS_MENU_BUTTONS,
    })
    return
  }

  await sendOrEditTelegramMessage({
    chatId: params.chatId,
    messageId: params.messageId,
    text: [
      "Detalle de libro / PDF",
      "",
      `Titulo: ${item.title}`,
      `Autor: ${item.author || "—"}`,
      `Descripcion: ${item.description || "—"}`,
      `Estado: ${item.is_published ? "Publicado" : "Oculto"}`,
      `Fecha: ${formatTelegramDate(item.created_at)}`,
      `URL publica: ${item.public_url || "—"}`,
    ].join("\n"),
    replyMarkup: buildOwnerPdfDetailKeyboard(item.id, item.is_published, params.backCallback),
  })
}

function getOwnerId(): number {
  const { TELEGRAM_OWNER_USER_ID } = loadServerEnv()
  const ownerId = TELEGRAM_OWNER_USER_ID ? Number(TELEGRAM_OWNER_USER_ID) : NaN
  return Number.isFinite(ownerId) ? ownerId : NaN
}

function isOwner(fromId: number | null) {
  const ownerId = getOwnerId()
  return Number.isFinite(ownerId) && fromId === ownerId
}

function extensionFromMime(mimeType?: string | null, sourceKind?: string) {
  if (mimeType === "audio/ogg") return "ogg"
  if (mimeType === "audio/mpeg") return "mp3"
  if (mimeType === "audio/mp4") return "m4a"
  if (mimeType === "audio/x-m4a") return "m4a"
  if (mimeType === "audio/wav") return "wav"
  if (sourceKind === "voice") return "ogg"
  return "bin"
}

async function getTelegramFilePath(fileId: string): Promise<string | null> {
  const { TELEGRAM_BOT_TOKEN } = loadServerEnv()
  if (!TELEGRAM_BOT_TOKEN) return null

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`)
    if (!res.ok) return null
    const data = (await res.json()) as { ok?: boolean; result?: { file_path?: string } }
    return data?.ok && typeof data?.result?.file_path === "string" ? data.result.file_path : null
  } catch {
    return null
  }
}

async function downloadTelegramFile(filePath: string): Promise<Buffer | null> {
  const { TELEGRAM_BOT_TOKEN } = loadServerEnv()
  if (!TELEGRAM_BOT_TOKEN) return null
  try {
    const res = await fetch(`https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`)
    if (!res.ok) return null
    const arr = await res.arrayBuffer()
    return Buffer.from(arr)
  } catch {
    return null
  }
}

async function clearPendingAudio(chatId: number) {
  await supabaseService.from("telegram_pending_audio").delete().eq("chat_id", chatId)
}

async function clearPendingPdf(chatId: number) {
  await supabaseService.from("telegram_pending_pdf").delete().eq("chat_id", chatId)
}

async function publishPendingAudio(params: {
  chatId: number
  fromId: number
  fromUsername: string | null
  fileId: string
  sourceKind: string
  mimeType: string | null
  sizeBytes: number | null
  title: string
}) {
  const filePath = await getTelegramFilePath(params.fileId)
  if (!filePath) return { ok: false as const, reason: "file_path" }

  const bytes = await downloadTelegramFile(filePath)
  if (!bytes) return { ok: false as const, reason: "download" }

  const now = new Date()
  const yyyy = String(now.getUTCFullYear())
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
  const ext = extensionFromMime(params.mimeType, params.sourceKind)
  const uuid = crypto.randomUUID()
  const bucket = "respuestas-audio"
  const storagePath = `${yyyy}/${mm}/${uuid}.${ext}`
  const contentType = params.mimeType || (params.sourceKind === "voice" ? "audio/ogg" : "application/octet-stream")

  const upload = await supabaseService.storage
    .from(bucket)
    .upload(storagePath, bytes, { contentType, upsert: false })

  if (upload.error) return { ok: false as const, reason: "upload" }

  const publicUrlData = supabaseService.storage.from(bucket).getPublicUrl(storagePath)
  const publicUrl = publicUrlData?.data?.publicUrl ?? null
  const createdBy = params.fromUsername ? `@${params.fromUsername}` : `tg:${params.fromId}`

  const insertRes = await supabaseService
    .from("respuestas_audio")
    .insert({
      title: params.title,
      storage_bucket: bucket,
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: params.mimeType,
      size_bytes: params.sizeBytes,
      created_by: createdBy,
    })

  if (insertRes.error) return { ok: false as const, reason: "insert" }

  await clearPendingAudio(params.chatId)
  return { ok: true as const }
}

async function publishPendingPdf(params: {
  chatId: number
  fromId: number
  fromUsername: string | null
  fileId: string
  mimeType: string | null
  sizeBytes: number | null
  title: string
  description: string
  author: string
}) {
  const filePath = await getTelegramFilePath(params.fileId)
  if (!filePath) return { ok: false as const, reason: "file_path" }

  const bytes = await downloadTelegramFile(filePath)
  if (!bytes) return { ok: false as const, reason: "download" }

  const now = new Date()
  const yyyy = String(now.getUTCFullYear())
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
  const uuid = crypto.randomUUID()
  const bucket = "libros-pdf"
  const storagePath = `${yyyy}/${mm}/${uuid}.pdf`
  const contentType = "application/pdf"

  const upload = await supabaseService.storage
    .from(bucket)
    .upload(storagePath, bytes, { contentType, upsert: false })

  if (upload.error) return { ok: false as const, reason: "upload" }

  const publicUrlData = supabaseService.storage.from(bucket).getPublicUrl(storagePath)
  const publicUrl = publicUrlData?.data?.publicUrl ?? null
  const actor = params.fromUsername ? `@${params.fromUsername}` : `tg:${params.fromId}`

  const insertOk = await createLibraryPdf({
    title: params.title,
    description: params.description,
    author: params.author,
    storage_path: storagePath,
    public_url: publicUrl,
    mime_type: params.mimeType || "application/pdf",
    size_bytes: params.sizeBytes,
    actor,
  })

  if (!insertOk) return { ok: false as const, reason: "insert" }

  await clearPendingPdf(params.chatId)
  return { ok: true as const }
}

export async function POST(req: Request) {
  const { TELEGRAM_SECRET_TOKEN } = loadServerEnv()
  if (TELEGRAM_SECRET_TOKEN) {
    const secret = req.headers.get("x-telegram-bot-api-secret-token")
    if (secret !== TELEGRAM_SECRET_TOKEN) {
      return new Response("unauthorized", { status: 401 })
    }
  }

  let update: TelegramUpdate | null = null
  try {
    update = (await req.json()) as TelegramUpdate
  } catch {
    return new Response("ok")
  }

  const msg = update?.message
  const callback = update?.callback_query
  const callbackMessage = callback?.message
  const text = typeof msg?.text === "string" ? msg.text.trim() : ""
  const chatId =
    typeof msg?.chat?.id === "number"
      ? msg.chat.id
      : typeof callbackMessage?.chat?.id === "number"
        ? callbackMessage.chat.id
        : null
  const fromId =
    typeof msg?.from?.id === "number"
      ? msg.from.id
      : typeof callback?.from?.id === "number"
        ? callback.from.id
        : null
  const fromUsername =
    typeof msg?.from?.username === "string"
      ? msg.from.username
      : typeof callback?.from?.username === "string"
        ? callback.from.username
        : null
  const callbackData = typeof callback?.data === "string" ? callback.data : ""
  const callbackId = typeof callback?.id === "string" ? callback.id : null
  const callbackMessageId = typeof callbackMessage?.message_id === "number" ? callbackMessage.message_id : null
  const voice = msg?.voice
  const audio = msg?.audio
  const document = msg?.document

  if (!chatId || !fromId) return new Response("ok")

  if (callbackData) {
    if (!isOwner(fromId)) {
      if (callbackId) await answerTelegramCallbackQuery(callbackId, "No autorizado")
      return new Response("ok")
    }

    if (callbackId) await answerTelegramCallbackQuery(callbackId)

    if (callbackData === "owner:main") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerMainMenuText(),
        replyMarkup: OWNER_MAIN_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:recommend") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerRecommendMenuText(),
        replyMarkup: OWNER_RECOMMEND_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:recommend:categories") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: "Recomendar video web\n\nElegi una categoria.",
        replyMarkup: buildOwnerRecommendCategoriesKeyboard(),
      })
      return new Response("ok")
    }

    if (callbackData === "owner:recommend:current") {
      const current = await getVideoRecommendation()
      const textCurrent = current
        ? `Recomendado actual\n\n${current.title || "Sin titulo"}\n${current.published_at ? formatTelegramDate(current.published_at) : "—"}\nID: ${current.youtube_video_id || "—"}`
        : "No hay un recomendado actual publicado."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textCurrent,
        replyMarkup: buildOwnerRecommendCurrentKeyboard(),
      })
      return new Response("ok")
    }

    if (callbackData === "owner:audio") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerAudioText(),
        replyMarkup: OWNER_AUDIO_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:answers") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerAnswersText(),
        replyMarkup: OWNER_ANSWERS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:answers:latest") {
      const answers = await listRespuestasAudio(10)
      const textAnswers = answers.length > 0 ? buildAnswerListText("Ultimas respuestas", answers) : "No hay respuestas publicadas."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textAnswers,
        replyMarkup: answers.length > 0 ? buildOwnerAnswerListKeyboard(answers, "owner:answers") : OWNER_ANSWERS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:answers:search") {
      await saveAudioSearchPrompt(chatId, fromId)
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerAnswersSearchText(),
        replyMarkup: {
          inline_keyboard: [
            [{ text: "Volver", callback_data: "owner:answers" }],
            [{ text: "Menu principal", callback_data: "owner:main" }],
          ],
        },
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:answers:detail:")) {
      const answerId = callbackData.split(":")[3] || ""
      const answer = await getRespuestaAudioById(answerId)

      if (!answer) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No pude cargar esa respuesta.",
          replyMarkup: OWNER_ANSWERS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: [
          "Detalle de respuesta",
          "",
          `Titulo: ${answer.title}`,
          `Fecha: ${formatTelegramDate(answer.created_at)}`,
          `Creado por: ${answer.created_by || "—"}`,
          `Mime: ${answer.mime_type || "—"}`,
          `Bytes: ${typeof answer.size_bytes === "number" ? answer.size_bytes : "—"}`,
          `URL publica: ${answer.public_url || "—"}`,
        ].join("\n"),
        replyMarkup: buildOwnerAnswerDetailKeyboard(answer.id, "owner:answers"),
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:answers:edit-title:")) {
      const answerId = callbackData.split(":")[3] || ""
      const answer = await getRespuestaAudioById(answerId)

      if (!answer) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No pude cargar esa respuesta.",
          replyMarkup: OWNER_ANSWERS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      await saveAudioEditTitlePrompt(chatId, fromId, answer.id)
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: `Editar titulo\n\nTitulo actual: ${answer.title}\n\nEnvia ahora el nuevo titulo.`,
        replyMarkup: {
          inline_keyboard: [
            [{ text: "Volver", callback_data: `owner:answers:detail:${answer.id}` }],
            [{ text: "Menu principal", callback_data: "owner:main" }],
          ],
        },
      })
      return new Response("ok")
    }

    if (callbackData === "owner:reading") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerReadingText(),
        replyMarkup: OWNER_READING_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:reading:current") {
      const reading = await getDailyReadingCurrent()
      const textReading = reading
        ? [
            "Lectura actual",
            "",
            reading.title,
            "",
            trimForTelegram(reading.content_md, 900),
            "",
            `Referencia: ${reading.reference_text || "—"}`,
            `Autor: ${reading.author || "—"}`,
            `Actualizada: ${formatTelegramDate(reading.updated_at)}`,
          ].join("\n")
        : "No hay una lectura publicada actualmente."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textReading,
        replyMarkup: OWNER_READING_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:reading:create") {
      await saveReadingEditorContext(chatId, fromId, {
        mode: "create",
        field: null,
        draft: { title: "", content_md: "", reference_text: "", author: "" },
      })

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerReadingEditorText({
          mode: "create",
          title: "",
          content_md: "",
          reference_text: "",
          author: "",
          awaitingField: null,
        }),
        replyMarkup: buildOwnerReadingEditorKeyboard(),
      })
      return new Response("ok")
    }

    if (callbackData === "owner:reading:edit") {
      const current = await getDailyReadingCurrent()
      if (!current) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No hay lectura actual para editar. Usa Crear o reemplazar lectura.",
          replyMarkup: OWNER_READING_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      await saveReadingEditorContext(chatId, fromId, {
        mode: "edit",
        field: null,
        draft: {
          title: current.title,
          content_md: current.content_md,
          reference_text: current.reference_text || "",
          author: current.author || "",
        },
      })

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerReadingEditorText({
          mode: "edit",
          title: current.title,
          content_md: current.content_md,
          reference_text: current.reference_text || "",
          author: current.author || "",
          awaitingField: null,
        }),
        replyMarkup: buildOwnerReadingEditorKeyboard(),
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:reading:field:")) {
      const fieldRaw = callbackData.split(":")[3] || ""
      const field =
        fieldRaw === "title" || fieldRaw === "content_md" || fieldRaw === "reference_text" || fieldRaw === "author"
          ? fieldRaw
          : null

      const editor = await getReadingEditorContext(chatId, fromId)
      if (!editor || !field) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No hay una edicion activa. Entra primero en Lectura del dia.",
          replyMarkup: OWNER_READING_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      await saveReadingEditorContext(chatId, fromId, { ...editor, field })
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerReadingEditorText({
          mode: editor.mode,
          title: editor.draft.title,
          content_md: editor.draft.content_md,
          reference_text: editor.draft.reference_text,
          author: editor.draft.author,
          awaitingField: field,
        }),
        replyMarkup: buildOwnerReadingEditorKeyboard(),
      })
      return new Response("ok")
    }

    if (callbackData === "owner:reading:confirm") {
      const editor = await getReadingEditorContext(chatId, fromId)
      if (!editor) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No hay una lectura en edicion. Entra primero en Lectura del dia.",
          replyMarkup: OWNER_READING_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      const actor = fromUsername ? `@${fromUsername}` : `tg:${fromId}`
      const ok = await publishDailyReadingCurrent(editor.draft, actor)
      if (!ok) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No pude publicar la lectura. Titulo y contenido son obligatorios.",
          replyMarkup: buildOwnerReadingEditorKeyboard(),
        })
        return new Response("ok")
      }

      await clearReadingEditorContext(chatId, fromId)
      revalidatePath("/")
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: `Lectura publicada ✅\n\n${editor.draft.title}`,
        replyMarkup: OWNER_READING_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:pdfs") {
      await clearPdfEditorContext(chatId, fromId)
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerPdfsText(),
        replyMarkup: OWNER_PDFS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:pdfs:published") {
      await clearPdfEditorContext(chatId, fromId)
      const items = await listLibraryPdfsByVisibility(true, 10)
      const textItems =
        items.length > 0
          ? `Libros publicados\n\n${items.map((item, index) => `${index + 1}. ${item.title}\n${formatTelegramDate(item.created_at)}\n${item.author || "—"}`).join("\n\n")}`
          : "No hay libros publicados."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textItems,
        replyMarkup: items.length > 0 ? buildOwnerPdfListKeyboard(items, "owner:pdfs:published") : OWNER_PDFS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:pdfs:hidden") {
      await clearPdfEditorContext(chatId, fromId)
      const items = await listLibraryPdfsByVisibility(false, 10)
      const textItems =
        items.length > 0
          ? `Libros ocultos\n\n${items.map((item, index) => `${index + 1}. ${item.title}\n${formatTelegramDate(item.created_at)}\n${item.author || "—"}`).join("\n\n")}`
          : "No hay libros ocultos."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textItems,
        replyMarkup: items.length > 0 ? buildOwnerPdfListKeyboard(items, "owner:pdfs:hidden") : OWNER_PDFS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:pdfs:start") {
      await clearPendingPdf(chatId)
      await clearPdfEditorContext(chatId, fromId)
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerPdfAwaitingFileText(),
        replyMarkup: OWNER_PDF_AWAITING_FILE_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:pdfs:cancel") {
      await clearPendingPdf(chatId)
      await clearPdfEditorContext(chatId, fromId)
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: "Carga cancelada.\n\nNo hay ningun PDF pendiente.",
        replyMarkup: OWNER_PDFS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:pdfs:detail:")) {
      const parts = callbackData.split(":")
      const pdfId = parts[3] || ""
      const backCallback = parsePdfBackCallback(parts.slice(4).join(":"))
      await clearPendingPdf(chatId)
      await clearPdfEditorContext(chatId, fromId)
      await renderPdfDetail({
        chatId,
        messageId: callbackMessageId,
        pdfId,
        backCallback,
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:pdfs:edit:")) {
      const parts = callbackData.split(":")
      const field = parts[3] === "title" || parts[3] === "description" || parts[3] === "author" ? parts[3] : null
      const pdfId = parts[4] || ""
      const backCallback = parsePdfBackCallback(parts.slice(5).join(":"))
      if (!field || !pdfId) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No pude iniciar la edición de ese campo.",
          replyMarkup: OWNER_PDFS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      await clearPendingPdf(chatId)
      await savePdfEditorContext(chatId, fromId, {
        pdf_id: pdfId,
        back_callback: backCallback,
        field,
      })

      const prompt =
        field === "title"
          ? "Editar libro\n\nEnvia ahora el nuevo titulo."
          : field === "description"
            ? "Editar libro\n\nEnvia ahora la nueva descripcion. Usa - para vaciar."
            : "Editar libro\n\nEnvia ahora el nuevo autor. Usa - para vaciar."
      const current = await getLibraryPdfById(pdfId)

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: prompt,
        replyMarkup: buildOwnerPdfDetailKeyboard(pdfId, current?.is_published ?? true, backCallback),
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:pdfs:hide:")) {
      const pdfId = callbackData.split(":")[3] || ""
      const actor = fromUsername ? `@${fromUsername}` : `tg:${fromId}`
      const ok = await setLibraryPdfPublished(pdfId, false, actor)
      await clearPdfEditorContext(chatId, fromId)
      if (!ok) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No pude ocultar ese libro.",
          replyMarkup: OWNER_PDFS_MENU_BUTTONS,
        })
        return new Response("ok")
      }
      await renderPdfDetail({ chatId, messageId: callbackMessageId, pdfId, backCallback: "owner:pdfs:published" })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:pdfs:restore:")) {
      const pdfId = callbackData.split(":")[3] || ""
      const actor = fromUsername ? `@${fromUsername}` : `tg:${fromId}`
      const ok = await setLibraryPdfPublished(pdfId, true, actor)
      await clearPdfEditorContext(chatId, fromId)
      if (!ok) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No pude restaurar ese libro.",
          replyMarkup: OWNER_PDFS_MENU_BUTTONS,
        })
        return new Response("ok")
      }
      await renderPdfDetail({ chatId, messageId: callbackMessageId, pdfId, backCallback: "owner:pdfs:hidden" })
      return new Response("ok")
    }

    if (callbackData === "owner:pdfs:confirm") {
      const pendingPdf = await supabaseService
        .from("telegram_pending_pdf")
        .select("file_id, mime_type, size_bytes, draft_title, draft_description, draft_author")
        .eq("chat_id", chatId)
        .eq("from_id", fromId)
        .maybeSingle()

      if (
        pendingPdf.error ||
        !pendingPdf.data
      ) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No hay un borrador activo. Usa 'Subir nuevo PDF'.",
          replyMarkup: OWNER_PDFS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      if (!pendingPdf.data.file_id) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "Falta el archivo PDF. Envia un PDF valido para continuar.",
          replyMarkup: OWNER_PDF_AWAITING_FILE_BUTTONS,
        })
        return new Response("ok")
      }

      if (!pendingPdf.data.draft_title || !pendingPdf.data.draft_title.trim()) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "Falta el titulo. Edita el titulo antes de confirmar.",
          replyMarkup: buildOwnerPdfDraftEditorKeyboard(),
        })
        return new Response("ok")
      }

      const publishResult = await publishPendingPdf({
        chatId,
        fromId,
        fromUsername,
        fileId: pendingPdf.data.file_id,
        mimeType: pendingPdf.data.mime_type,
        sizeBytes: pendingPdf.data.size_bytes,
        title: pendingPdf.data.draft_title,
        description: pendingPdf.data.draft_description || "",
        author: pendingPdf.data.draft_author || "",
      })

      if (!publishResult.ok) {
        const errorText =
          publishResult.reason === "file_path"
            ? "No pude obtener el archivo desde Telegram."
            : publishResult.reason === "download"
              ? "No pude descargar el PDF desde Telegram."
              : publishResult.reason === "upload"
                ? "No pude subir el PDF al bucket libros-pdf."
                : "No pude guardar la metadata del PDF."

        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: errorText,
          replyMarkup: buildOwnerPdfDraftEditorKeyboard(),
        })
        return new Response("ok")
      }

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: `PDF publicado ✅\n\n${pendingPdf.data.draft_title}`,
        replyMarkup: OWNER_PDFS_MENU_BUTTONS,
      })
      const latestPublished = await listLibraryPdfsByVisibility(true, 1)
      if (latestPublished[0]) {
        await renderPdfDetail({
          chatId,
          pdfId: latestPublished[0].id,
          backCallback: "owner:pdfs:published",
        })
      }
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:pdfs:draft:field:")) {
      const field = callbackData.split(":")[4]
      if (field !== "title" && field !== "description" && field !== "author") {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "Campo inválido.",
          replyMarkup: OWNER_PDFS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      const pendingPdf = await supabaseService
        .from("telegram_pending_pdf")
        .select("chat_id")
        .eq("chat_id", chatId)
        .eq("from_id", fromId)
        .maybeSingle()

      if (pendingPdf.error || !pendingPdf.data) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No hay borrador activo. Usa 'Subir nuevo PDF'.",
          replyMarkup: OWNER_PDFS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      await supabaseService
        .from("telegram_pending_pdf")
        .update({ awaiting_field: field })
        .eq("chat_id", chatId)
        .eq("from_id", fromId)

      await renderPdfDraftEditor({
        chatId,
        messageId: callbackMessageId,
        fromId,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:questions") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerQuestionsText(),
        replyMarkup: OWNER_QUESTIONS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:questions:pending" || callbackData.startsWith("owner:questions:pending:")) {
      const rawOffset = callbackData.split(":")[3]
      const offset = rawOffset ? Number(rawOffset) : 0
      const pageSize = 5
      const questions = await listPendingAudienceQuestions(pageSize + 1, Number.isFinite(offset) && offset >= 0 ? offset : 0)
      const hasNext = questions.length > pageSize
      const visible = hasNext ? questions.slice(0, pageSize) : questions
      const textQuestions =
        visible.length > 0 ? buildQuestionListText("Preguntas pendientes", visible) : "No hay preguntas pendientes."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textQuestions,
        replyMarkup: visible.length > 0
          ? buildOwnerQuestionListKeyboard(visible, "pending", {
              offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
              pageSize,
              hasNext,
            })
          : OWNER_QUESTIONS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:questions:selected" || callbackData.startsWith("owner:questions:selected:")) {
      const rawOffset = callbackData.split(":")[3]
      const offset = rawOffset ? Number(rawOffset) : 0
      const pageSize = 5
      const questions = await listSelectedAudienceQuestionsForOwner(pageSize + 1, Number.isFinite(offset) && offset >= 0 ? offset : 0)
      const hasNext = questions.length > pageSize
      const visible = hasNext ? questions.slice(0, pageSize) : questions
      const textQuestions =
        visible.length > 0 ? buildQuestionListText("Preguntas seleccionadas", visible) : "No hay preguntas seleccionadas."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textQuestions,
        replyMarkup: visible.length > 0
          ? buildOwnerQuestionListKeyboard(visible, "selected", {
              offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
              pageSize,
              hasNext,
            })
          : OWNER_QUESTIONS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:questions:hidden" || callbackData.startsWith("owner:questions:hidden:")) {
      const rawOffset = callbackData.split(":")[3]
      const offset = rawOffset ? Number(rawOffset) : 0
      const pageSize = 5
      const questions = await listHiddenAudienceQuestions(pageSize + 1, Number.isFinite(offset) && offset >= 0 ? offset : 0)
      const hasNext = questions.length > pageSize
      const visible = hasNext ? questions.slice(0, pageSize) : questions
      const textQuestions =
        visible.length > 0 ? buildQuestionListText("Preguntas ocultas", visible) : "No hay preguntas ocultas."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textQuestions,
        replyMarkup: visible.length > 0
          ? buildOwnerQuestionListKeyboard(visible, "hidden", {
              offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
              pageSize,
              hasNext,
            })
          : OWNER_QUESTIONS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:questions:detail:")) {
      const parts = callbackData.split(":")
      const questionId = parts[3] || ""
      const listType = parts[4] === "selected" || parts[4] === "hidden" ? parts[4] : "pending"
      const question = await getAudienceQuestionById(questionId)

      if (!question) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No pude cargar esa pregunta.",
          replyMarkup: OWNER_QUESTIONS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      const stateLabel = question.is_hidden ? "Oculta" : question.is_selected ? "Seleccionada" : "Pendiente"
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: [
          "Detalle de pregunta",
          "",
          `Estado: ${stateLabel}`,
          `Autor: ${question.author_name || "Anonimo"}`,
          `Fecha: ${formatTelegramDate(question.published_at || null)}`,
          `Comment ID: ${question.comment_id || "—"}`,
          `Video ID: ${question.youtube_video_id || "—"}`,
          `Likes: ${typeof question.like_count === "number" ? question.like_count : "—"}`,
          "",
          question.text_display || "Sin texto",
        ].join("\n"),
        replyMarkup: buildOwnerQuestionDetailKeyboard(question.id, listType, {
          isSelected: Boolean(question.is_selected),
          isHidden: Boolean(question.is_hidden),
        }),
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:questions:select:")) {
      const parts = callbackData.split(":")
      const questionId = parts[3] || ""
      const listType = parts[4] === "selected" || parts[4] === "hidden" ? parts[4] : "pending"
      const selectedBy = fromUsername ? `@${fromUsername}` : `tg:${fromId}`
      const ok = await selectAudienceQuestionById(questionId, selectedBy)
      const question = await getAudienceQuestionById(questionId)

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text:
          ok && question
            ? [
                "Pregunta seleccionada ✅",
                "",
                `Autor: ${question.author_name || "Anonimo"}`,
                question.text_display || "Sin texto",
              ].join("\n")
            : "No pude seleccionar esa pregunta.",
        replyMarkup: question
          ? buildOwnerQuestionDetailKeyboard(question.id, listType, {
              isSelected: Boolean(question.is_selected),
              isHidden: Boolean(question.is_hidden),
            })
          : OWNER_QUESTIONS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:questions:hide:")) {
      const parts = callbackData.split(":")
      const questionId = parts[3] || ""
      const listType = parts[4] === "selected" || parts[4] === "hidden" ? parts[4] : "pending"
      const ok = await hideAudienceQuestionById(questionId)
      const question = await getAudienceQuestionById(questionId)

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text:
          ok && question
            ? [
                "Pregunta ocultada ✅",
                "",
                `Autor: ${question.author_name || "Anonimo"}`,
                question.text_display || "Sin texto",
              ].join("\n")
            : "No pude ocultar esa pregunta.",
        replyMarkup: question
          ? buildOwnerQuestionDetailKeyboard(question.id, listType, {
              isSelected: Boolean(question.is_selected),
              isHidden: Boolean(question.is_hidden),
            })
          : OWNER_QUESTIONS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:questions:restore:")) {
      const parts = callbackData.split(":")
      const questionId = parts[3] || ""
      const listType = parts[4] === "selected" || parts[4] === "hidden" ? parts[4] : "hidden"
      const ok = await restoreAudienceQuestionById(questionId)
      const question = await getAudienceQuestionById(questionId)

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text:
          ok && question
            ? [
                "Pregunta restaurada ✅",
                "",
                `Autor: ${question.author_name || "Anonimo"}`,
                question.text_display || "Sin texto",
              ].join("\n")
            : "No pude restaurar esa pregunta.",
        replyMarkup: question
          ? buildOwnerQuestionDetailKeyboard(question.id, listType, {
              isSelected: Boolean(question.is_selected),
              isHidden: Boolean(question.is_hidden),
            })
          : OWNER_QUESTIONS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:audio:start") {
      await clearPendingAudio(chatId)
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerAudioAwaitingFileText(),
        replyMarkup: OWNER_AUDIO_AWAITING_FILE_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:audio:list") {
      const audios = await listRespuestasAudio(5)
      const textAudios =
        audios.length > 0
          ? `Respuestas publicadas\n\n${audios
              .map((audio, index) => `${index + 1}. ${audio.title}\n${formatTelegramDate(audio.created_at)}`)
              .join("\n\n")}`
          : "No hay respuestas publicadas todavia."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textAudios,
        replyMarkup: OWNER_AUDIO_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:audio:cancel") {
      await clearPendingAudio(chatId)
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: "Carga cancelada.\n\nNo hay ningun audio pendiente.",
        replyMarkup: OWNER_AUDIO_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:audio:confirm") {
      const pendingAudio = await supabaseService
        .from("telegram_pending_audio")
        .select("chat_id, from_id, file_id, source_kind, mime_type, size_bytes, draft_title")
        .eq("chat_id", chatId)
        .eq("from_id", fromId)
        .maybeSingle()

      if (pendingAudio.error || !pendingAudio.data || !pendingAudio.data.file_id || !pendingAudio.data.draft_title) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No hay una carga lista para publicar. Usa Publicar audio e inicia una nueva carga.",
          replyMarkup: OWNER_AUDIO_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      const publishResult = await publishPendingAudio({
        chatId,
        fromId,
        fromUsername,
        fileId: pendingAudio.data.file_id,
        sourceKind: pendingAudio.data.source_kind,
        mimeType: pendingAudio.data.mime_type,
        sizeBytes: pendingAudio.data.size_bytes,
        title: pendingAudio.data.draft_title,
      })

      if (!publishResult.ok) {
        const errorText =
          publishResult.reason === "file_path"
            ? "No pude obtener el archivo desde Telegram."
            : publishResult.reason === "download"
              ? "No pude descargar el archivo desde Telegram."
              : publishResult.reason === "upload"
                ? "No pude subir el audio a Storage."
                : "No pude guardar metadata del audio."

        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: errorText,
          replyMarkup: OWNER_AUDIO_CONFIRM_BUTTONS,
        })
        return new Response("ok")
      }

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: `Publicado ✅\n\n${pendingAudio.data.draft_title}`,
        replyMarkup: OWNER_AUDIO_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:videos") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerVideosText(),
        replyMarkup: OWNER_VIDEOS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:videos:categories") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: "Videos del canal\n\nElegi una categoria para ver videos reales.",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "Series Biblicas", callback_data: "owner:videos:list:series-biblicas:0" }],
            [{ text: "Watchman Nee", callback_data: "owner:videos:list:watchman-nee:0" }],
            [{ text: "Lives", callback_data: "owner:videos:list:lives:0" }],
            [{ text: "Cortes", callback_data: "owner:videos:list:cortes:0" }],
            [{ text: "Shorts", callback_data: "owner:videos:list:shorts:0" }],
            [{ text: "Club del Libro", callback_data: "owner:videos:list:club-del-libro:0" }],
            [{ text: "Reflexiones", callback_data: "owner:videos:list:reflexiones:0" }],
            [{ text: "Ensenanzas", callback_data: "owner:videos:list:ensenanzas:0" }],
            [
              { text: "Volver", callback_data: "owner:videos" },
              { text: "Menu principal", callback_data: "owner:main" },
            ],
          ],
        },
      })
      return new Response("ok")
    }

    if (callbackData === "owner:videos:latest") {
      const latestVideos = await listLatestVideoSummaries(10)
      const textLatest = latestVideos.length > 0 ? buildVideoListText("Ultimos videos", latestVideos) : "No encontre videos recientes."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textLatest,
        replyMarkup: latestVideos.length > 0 ? buildOwnerVideoListKeyboard(latestVideos, "owner:videos") : OWNER_VIDEOS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:videos:search") {
      await saveVideoSearchPrompt(chatId, fromId)
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerVideosSearchText(),
        replyMarkup: {
          inline_keyboard: [
            [{ text: "Volver", callback_data: "owner:videos" }],
            [{ text: "Menu principal", callback_data: "owner:main" }],
          ],
        },
      })
      return new Response("ok")
    }

    if (callbackData === "owner:videos:unclassified") {
      const videos = await listVideosWithoutSeriesCollection(10)
      const textUnclassified =
        videos.length > 0
          ? buildVideoListText("Videos sin clasificar en series_collection", videos)
          : "No encontre videos sin clasificar en series_collection."

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textUnclassified,
        replyMarkup: videos.length > 0 ? buildOwnerVideoListKeyboard(videos, "owner:videos") : OWNER_VIDEOS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:videos:list:")) {
      const parts = callbackData.split(":")
      const categorySlug = (parts[3] || "").trim().toLowerCase()
      const offset = Number(parts[4] || "0")
      const category = getTelegramEditorialCategory(categorySlug)

      if (!category || !Number.isInteger(offset) || offset < 0) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "Categoria invalida.",
          replyMarkup: OWNER_VIDEOS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      const videos = await listVideosByTelegramEditorialCategory(category.slug, offset, 10)
      if (videos.length === 0) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: `No encontre videos para ${category.label}.`,
          replyMarkup: OWNER_VIDEOS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildVideoListText(`Categoria: ${category.label}`, videos),
        replyMarkup: buildOwnerVideoListKeyboard(videos, "owner:videos:categories"),
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:videos:detail:")) {
      const youtubeVideoId = callbackData.split(":")[3] || ""
      const detail = await getVideoEditorialDetailByYoutubeId(youtubeVideoId)

      if (!detail) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No pude cargar ese video.",
          replyMarkup: OWNER_VIDEOS_MENU_BUTTONS,
        })
        return new Response("ok")
      }

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: [
          "Detalle de video",
          "",
          detail.title,
          formatTelegramDate(detail.published_at),
          `ID: ${detail.youtube_video_id}`,
          `Slug: ${detail.slug || "—"}`,
        ].join("\n"),
        replyMarkup: buildOwnerVideoDetailKeyboard(detail.youtube_video_id, "owner:videos"),
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:videos:classification:")) {
      const youtubeVideoId = callbackData.split(":")[3] || ""
      const rows = await listVideoEditorialClassificationByYoutubeId(youtubeVideoId)

      if (rows.length === 0) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No encontre clasificacion editorial para ese video.",
          replyMarkup: buildOwnerVideoClassificationKeyboard(youtubeVideoId, "owner:videos"),
        })
        return new Response("ok")
      }

      const textClassification = [
        "Clasificacion editorial",
        "",
        ...rows.map((row) =>
          [
            `${row.dimension_code}: ${row.term_label}`,
            `slug: ${row.term_slug}`,
            `source: ${row.source_kind}`,
            `confidence: ${row.confidence.toFixed(4)}`,
          ].join("\n")
        ),
      ].join("\n\n")

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: textClassification,
        replyMarkup: buildOwnerVideoClassificationKeyboard(youtubeVideoId, "owner:videos"),
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:recommend:list:")) {
      const parts = callbackData.split(":")
      const categorySlug = (parts[3] || "").trim().toLowerCase()
      const offset = Number(parts[4] || "0")
      const category = getTelegramEditorialCategory(categorySlug)

      if (!category || !Number.isInteger(offset) || offset < 0) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "Categoria invalida.",
          replyMarkup: buildOwnerRecommendCategoriesKeyboard(),
        })
        return new Response("ok")
      }

      const videos = await listVideosByTelegramEditorialCategory(category.slug, offset, 10)
      if (videos.length === 0) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: `No encontre videos para ${category.label}.`,
          replyMarkup: buildOwnerRecommendCategoriesKeyboard(),
        })
        return new Response("ok")
      }

      await saveTelegramEditorialListContext(chatId, fromId, category.slug, offset, videos)

      const lines = videos.map((video, index) => `${offset + index + 1}. ${video.title}\n${formatTelegramDate(video.published_at)}`)
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: `Categoria: ${category.label}\n\n${lines.join("\n\n")}`,
        replyMarkup: buildOwnerRecommendVideoListKeyboard(category.slug, videos, offset, videos.length === 10),
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:recommend:pick:")) {
      const youtubeVideoId = callbackData.split(":")[3] || ""
      const video = await getVideoSummaryByYoutubeId(youtubeVideoId)

      if (!video) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No pude cargar ese video.",
          replyMarkup: buildOwnerRecommendCategoriesKeyboard(),
        })
        return new Response("ok")
      }

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: `Confirmar publicacion\n\n${video.title}\n${formatTelegramDate(video.published_at)}\nID: ${video.youtube_video_id}`,
        replyMarkup: buildOwnerRecommendConfirmKeyboard(video.youtube_video_id),
      })
      return new Response("ok")
    }

    if (callbackData.startsWith("owner:recommend:confirm:")) {
      const youtubeVideoId = callbackData.split(":")[3] || ""
      const video = await getVideoSummaryByYoutubeId(youtubeVideoId)

      if (!video) {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No encontre ese video en la base. Primero debe estar sincronizado.",
          replyMarkup: buildOwnerRecommendCategoriesKeyboard(),
        })
        return new Response("ok")
      }

      const setBy = fromUsername ? `@${fromUsername}` : `tg:${fromId}`
      const result = await setVideoRecommendationByYoutubeId(youtubeVideoId, setBy)

      if (!result.ok && result.reason === "not_found_in_videos") {
        await sendOrEditTelegramMessage({
          chatId,
          messageId: callbackMessageId,
          text: "No encontre ese video en la base. Primero debe estar sincronizado.",
          replyMarkup: buildOwnerRecommendCategoriesKeyboard(),
        })
        return new Response("ok")
      }

      revalidatePath("/")
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: `Recomendado web actualizado\n\n${video.title}\n${formatTelegramDate(video.published_at)}\nID: ${video.youtube_video_id}`,
        replyMarkup: buildOwnerRecommendCurrentKeyboard(),
      })
      return new Response("ok")
    }

    if (callbackData === "owner:status") {
      const [videosCountRes, pendingQuestionsRes, audiosCountRes, latestSyncRes, currentRecommendation] = await Promise.all([
        supabaseService.from("videos").select("*", { count: "exact", head: true }),
        supabaseService
          .from("video_questions")
          .select("*", { count: "exact", head: true })
          .eq("is_selected", false)
          .eq("is_hidden", false),
        supabaseService.from("respuestas_audio").select("*", { count: "exact", head: true }),
        supabaseService
          .from("sync_runs")
          .select("source,status,started_at")
          .order("started_at", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle(),
        getVideoRecommendation(),
      ])

      const statusText = buildOwnerStatusText({
        videosCount: videosCountRes.count ?? 0,
        pendingQuestionsCount: pendingQuestionsRes.count ?? 0,
        audiosCount: audiosCountRes.count ?? 0,
        latestSyncSource: latestSyncRes.data?.source ?? null,
        latestSyncStatus: latestSyncRes.data?.status ?? null,
        latestSyncStartedAt: latestSyncRes.data?.started_at ?? null,
        recommendedTitle: currentRecommendation?.title ?? null,
        recommendedYoutubeId: currentRecommendation?.youtube_video_id ?? null,
      })

      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: statusText,
        replyMarkup: OWNER_STATUS_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    if (callbackData === "owner:help") {
      await sendOrEditTelegramMessage({
        chatId,
        messageId: callbackMessageId,
        text: buildOwnerHelpText(),
        replyMarkup: OWNER_HELP_MENU_BUTTONS,
      })
      return new Response("ok")
    }

    await sendOrEditTelegramMessage({
      chatId,
      messageId: callbackMessageId,
      text: buildOwnerMainMenuText(),
      replyMarkup: OWNER_MAIN_MENU_BUTTONS,
    })
    return new Response("ok")
  }

  if (text) {
    if (text === "/start") {
      await sendTelegramMessage(chatId, "Bot activo ✅")
      return new Response("ok")
    }

    const owner = isOwner(fromId)
    if (!owner) {
      await sendTelegramMessage(chatId, "No autorizado")
      return new Response("ok")
    }

    const supportedCommand =
      text.startsWith("/recomendar") ||
      text.startsWith("/audios") ||
      text.startsWith("/listar-categorias") ||
      text.startsWith("/listar-videos") ||
      text.startsWith("/recomendado-web") ||
      text === "/recomendado" ||
      text.startsWith("/recomendado@") ||
      text.startsWith("/menu")
    if (!supportedCommand) {
      const [pendingForTitle, hasVideoSearchPrompt, hasAudioSearchPromptActive, audioEditTitlePromptId, readingEditor] = await Promise.all([
        supabaseService
          .from("telegram_pending_audio")
          .select("chat_id")
          .eq("chat_id", chatId)
          .eq("from_id", fromId)
          .maybeSingle(),
        hasActiveVideoSearchPrompt(chatId, fromId),
        hasActiveAudioSearchPrompt(chatId, fromId),
        getActiveAudioEditTitlePrompt(chatId, fromId),
        getReadingEditorContext(chatId, fromId),
      ])
      const [pendingPdfPrompt, pdfEditor] = await Promise.all([
        supabaseService
          .from("telegram_pending_pdf")
          .select("awaiting_field")
          .eq("chat_id", chatId)
          .eq("from_id", fromId)
          .maybeSingle(),
        getPdfEditorContext(chatId, fromId),
      ])

      if (hasVideoSearchPrompt) {
        // Hay prompt activo: dejar que el flujo de búsqueda procese este texto.
      } else if (hasAudioSearchPromptActive) {
        // Hay prompt activo: dejar que el flujo de búsqueda de respuestas procese este texto.
      } else if (audioEditTitlePromptId) {
        // Hay prompt activo: dejar que la edición de título procese este texto.
      } else if (readingEditor?.field) {
        // Hay prompt activo: dejar que la edición de lectura procese este texto.
      } else if (!pendingPdfPrompt.error && pendingPdfPrompt.data?.awaiting_field) {
        // Hay prompt activo: dejar que la edición de borrador PDF procese este texto.
      } else if (pdfEditor?.field) {
        // Hay prompt activo: dejar que la edición de PDF publicado procese este texto.
      } else if (!pendingForTitle.error && pendingForTitle.data) {
        // Hay pending activo: dejar que el flujo de publicación procese este texto como título.
      } else {
        await sendTelegramMessage(chatId, "Recibido ✅")
        return new Response("ok")
      }
    }
  }

  if (!isOwner(fromId)) {
    if (text.startsWith("/recomendar") || text.startsWith("/audios") || text.startsWith("/recomendado-web") || voice || audio || document) {
      await sendTelegramMessage(chatId, "No autorizado")
    }
    return new Response("ok")
  }

  if (voice || audio) {
    const sourceKind = voice ? "voice" : "audio"
    const fileId = (voice?.file_id || audio?.file_id || "").trim()
    const fileUniqueId = (voice?.file_unique_id || audio?.file_unique_id || "").trim() || null
    const mimeType = (voice?.mime_type || audio?.mime_type || "").trim() || null
    const sizeBytes = typeof (voice?.file_size ?? audio?.file_size) === "number" ? Number(voice?.file_size ?? audio?.file_size) : null

    if (!fileId) {
      await sendTelegramMessage(chatId, "No pude leer el archivo de audio.")
      return new Response("ok")
    }

    await supabaseService
      .from("telegram_pending_audio")
      .upsert({
        chat_id: chatId,
        from_id: fromId,
        file_id: fileId,
        file_unique_id: fileUniqueId,
        source_kind: sourceKind,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        draft_title: null,
      }, { onConflict: "chat_id" })

    await sendTelegramMessage(chatId, buildOwnerAudioAwaitingTitleText(), OWNER_AUDIO_AWAITING_FILE_BUTTONS)
    return new Response("ok")
  }

  if (document) {
    const fileId = (document.file_id || "").trim()
    const fileUniqueId = (document.file_unique_id || "").trim() || null
    const mimeType = (document.mime_type || "").trim() || null
    const sizeBytes = typeof document.file_size === "number" ? Number(document.file_size) : null

    if (!fileId || mimeType !== "application/pdf") {
      await sendTelegramMessage(chatId, "Solo puedo recibir archivos PDF válidos.", OWNER_PDF_AWAITING_FILE_BUTTONS)
      return new Response("ok")
    }

    await supabaseService
      .from("telegram_pending_pdf")
      .upsert({
        chat_id: chatId,
        from_id: fromId,
        file_id: fileId,
        file_unique_id: fileUniqueId,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        draft_title: null,
        draft_description: null,
        draft_author: null,
        awaiting_field: null,
      }, { onConflict: "chat_id" })
    await clearPdfEditorContext(chatId, fromId)
    await renderPdfDraftEditor({ chatId, fromId })
    return new Response("ok")
  }

  if (text.startsWith("/audios")) {
    const recent = await supabaseService
      .from("respuestas_audio")
      .select("title, created_at")
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(5)

    if (recent.error || !recent.data || recent.data.length === 0) {
      await sendTelegramMessage(chatId, "No hay audios publicados todavía.")
      return new Response("ok")
    }

    const lines = recent.data.map((r: any) => {
      const title = typeof r?.title === "string" ? r.title : "Sin título"
      const date = typeof r?.created_at === "string" ? r.created_at.slice(0, 10) : "—"
      return `- ${title} (${date})`
    })
    await sendTelegramMessage(chatId, `Últimos audios:\n${lines.join("\n")}`)
    return new Response("ok")
  }

  if (text.startsWith("/menu")) {
    await sendTelegramMessage(chatId, "Actualizando menú…", { remove_keyboard: true })
    await sendTelegramMessage(chatId, buildOwnerMainMenuText(), OWNER_MAIN_MENU_BUTTONS)
    return new Response("ok")
  }

  if (text.startsWith("/listar-categorias")) {
    const lines = [
      "1. series-biblicas",
      "2. watchman-nee",
      "3. lives",
      "4. cortes",
      "5. shorts",
      "6. club-del-libro",
      "7. reflexiones",
      "8. ensenanzas",
    ]
    await sendTelegramMessage(chatId, `Categorías disponibles:\n${lines.join("\n")}`)
    return new Response("ok")
  }

  if (text.startsWith("/listar-videos")) {
    const parts = text.split(/\s+/).filter(Boolean)
    const categorySlug = (parts[1] || "").trim().toLowerCase()
    const rawOffset = (parts[2] || "").trim()
    const offset = rawOffset ? Number(rawOffset) : 0
    const category = getTelegramEditorialCategory(categorySlug)

    if (!category) {
      await sendTelegramMessage(chatId, "Uso: /listar-videos <categoria> [offset]")
      return new Response("ok")
    }

    if (!Number.isInteger(offset) || offset < 0) {
      await sendTelegramMessage(chatId, "El offset debe ser un entero mayor o igual a 0.")
      return new Response("ok")
    }

    const videos = await listVideosByTelegramEditorialCategory(category.slug, offset, 10)
    if (videos.length === 0) {
      await sendTelegramMessage(chatId, `No encontré videos para ${category.label}.`)
      return new Response("ok")
    }

    await saveTelegramEditorialListContext(chatId, fromId, category.slug, offset, videos)

    const lines = videos.flatMap((video, index) => [
      `${offset + index + 1}. ${video.title}`,
      `${formatTelegramDate(video.published_at)}`,
      `ID: ${video.youtube_video_id}`,
      "",
    ])

    if (lines[lines.length - 1] === "") lines.pop()

    await sendTelegramMessage(chatId, `Categoría: ${category.label}\n${lines.join("\n")}`)
    return new Response("ok")
  }

  if (text.startsWith("/recomendado-web")) {
    const parts = text.split(/\s+/).filter(Boolean)
    const rawNumber = (parts[1] || "").trim()
    const itemNumber = Number(rawNumber)

    if (!Number.isInteger(itemNumber) || itemNumber <= 0) {
      await sendTelegramMessage(chatId, "Número inválido. Elige uno de la última lista mostrada.")
      return new Response("ok")
    }

    const context = await getActiveTelegramEditorialListContext(chatId, fromId)
    if (!context || context.items.length === 0) {
      await sendTelegramMessage(chatId, "No hay una lista reciente. Usa /listar-videos <categoria> primero.")
      return new Response("ok")
    }

    const selected = context.items.find((item) => item.index === itemNumber)
    if (!selected) {
      await sendTelegramMessage(chatId, "Número inválido. Elige uno de la última lista mostrada.")
      return new Response("ok")
    }

    const setBy = fromUsername ? `@${fromUsername}` : `tg:${fromId}`
    const result = await setVideoRecommendationByYoutubeId(selected.youtube_video_id, setBy)

    if (!result.ok && result.reason === "not_found_in_videos") {
      await sendTelegramMessage(chatId, "No encontré ese video en la base. Primero debe estar sincronizado.")
      return new Response("ok")
    }

    revalidatePath("/")
    await sendTelegramMessage(
      chatId,
      `Recomendado web actualizado:\n${selected.index}. ${selected.title}\nID: ${selected.youtube_video_id}`
    )
    return new Response("ok")
  }

  if (text === "/recomendado" || text.startsWith("/recomendado@")) {
    await sendTelegramMessage(chatId, "Recomendar video web\n\nElegi una categoria.", buildOwnerRecommendCategoriesKeyboard())
    return new Response("ok")
  }

  if (text.startsWith("/recomendar")) {
    const parts = text.split(/\s+/).filter(Boolean)
    const youtubeVideoId = parts[1]
    if (!youtubeVideoId) {
      await sendTelegramMessage(chatId, "Uso: /recomendar <youtube_video_id>")
      return new Response("ok")
    }

    const setBy = fromUsername ? `@${fromUsername}` : `tg:${fromId}`
    const result = await setVideoRecommendationByYoutubeId(youtubeVideoId, setBy)

    if (!result.ok && result.reason === "not_found_in_videos") {
      await sendTelegramMessage(chatId, "No encontré ese video en la base. Primero debe estar sincronizado.")
      return new Response("ok")
    }

    revalidatePath("/")
    await sendTelegramMessage(chatId, "Video recomendado actualizado ✅")
    return new Response("ok")
  }

  const pending = await supabaseService
    .from("telegram_pending_audio")
    .select("chat_id, from_id, file_id, file_unique_id, source_kind, mime_type, size_bytes, draft_title")
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .maybeSingle()

  if (!pending.error && pending.data) {
    const title = text.trim()
    if (!title) {
      await sendTelegramMessage(chatId, "Enviame un título válido para publicar el audio.")
      return new Response("ok")
    }

    const titleUpdate = await supabaseService
      .from("telegram_pending_audio")
      .update({ draft_title: title })
      .eq("chat_id", chatId)
      .eq("from_id", fromId)

    if (titleUpdate.error) {
      await sendTelegramMessage(chatId, "No pude guardar el título del audio.")
      return new Response("ok")
    }

    await sendTelegramMessage(
      chatId,
      buildOwnerAudioConfirmText({
        title,
        sourceKind: pending.data.source_kind,
        mimeType: pending.data.mime_type,
      }),
      OWNER_AUDIO_CONFIRM_BUTTONS
    )
    return new Response("ok")
  }

  const pendingPdf = await supabaseService
    .from("telegram_pending_pdf")
    .select("draft_title, draft_description, draft_author, awaiting_field")
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .maybeSingle()

  if (!pendingPdf.error && pendingPdf.data && pendingPdf.data.awaiting_field) {
    const input = text.trim()
    const normalized = input === "-" ? "" : input

    if (pendingPdf.data.awaiting_field === "title") {
      if (!normalized) {
        await sendTelegramMessage(chatId, "Enviame un titulo valido para el PDF.", buildOwnerPdfDraftEditorKeyboard())
        return new Response("ok")
      }

      await supabaseService
        .from("telegram_pending_pdf")
        .update({ draft_title: normalized, awaiting_field: null })
        .eq("chat_id", chatId)
        .eq("from_id", fromId)
      await renderPdfDraftEditor({ chatId, fromId })
      return new Response("ok")
    }

    if (pendingPdf.data.awaiting_field === "description") {
      await supabaseService
        .from("telegram_pending_pdf")
        .update({ draft_description: normalized || null, awaiting_field: null })
        .eq("chat_id", chatId)
        .eq("from_id", fromId)
      await renderPdfDraftEditor({ chatId, fromId })
      return new Response("ok")
    }

    await supabaseService
      .from("telegram_pending_pdf")
      .update({ draft_author: normalized || null, awaiting_field: null })
      .eq("chat_id", chatId)
      .eq("from_id", fromId)
    await renderPdfDraftEditor({ chatId, fromId })
    return new Response("ok")
  }

  const pdfEditor = await getPdfEditorContext(chatId, fromId)
  if (pdfEditor?.field) {
    const item = await getLibraryPdfById(pdfEditor.pdf_id)
    if (!item) {
      await clearPdfEditorContext(chatId, fromId)
      await sendTelegramMessage(chatId, "No pude cargar ese libro.", OWNER_PDFS_MENU_BUTTONS)
      return new Response("ok")
    }

    const normalized = text.trim() === "-" ? "" : text.trim()
    const actor = fromUsername ? `@${fromUsername}` : `tg:${fromId}`
    const ok = await updateLibraryPdfMetadata(item.id, pdfEditor.field, normalized, actor)
    if (!ok) {
      const errorText = pdfEditor.field === "title" ? "El titulo no puede quedar vacío." : "No pude actualizar el campo."
      await sendTelegramMessage(chatId, errorText, buildOwnerPdfDetailKeyboard(item.id, item.is_published, pdfEditor.back_callback))
      return new Response("ok")
    }

    await savePdfEditorContext(chatId, fromId, { ...pdfEditor, field: null })
    await sendTelegramMessage(chatId, "Campo actualizado ✅")
    await renderPdfDetail({
      chatId,
      pdfId: item.id,
      backCallback: pdfEditor.back_callback,
    })
    return new Response("ok")
  }

  const readingEditor = await getReadingEditorContext(chatId, fromId)
  if (readingEditor?.field) {
    const nextDraft = {
      ...readingEditor.draft,
      [readingEditor.field]: text.trim(),
    }

    await saveReadingEditorContext(chatId, fromId, {
      mode: readingEditor.mode,
      field: null,
      draft: nextDraft,
    })

    await sendTelegramMessage(
      chatId,
      buildOwnerReadingEditorText({
        mode: readingEditor.mode,
        title: nextDraft.title,
        content_md: nextDraft.content_md,
        reference_text: nextDraft.reference_text,
        author: nextDraft.author,
        awaitingField: null,
      }),
      buildOwnerReadingEditorKeyboard()
    )
    return new Response("ok")
  }

  const audioEditId = await getActiveAudioEditTitlePrompt(chatId, fromId)
  if (audioEditId) {
    const ok = await updateRespuestaAudioTitle(audioEditId, text)
    await clearAudioEditTitlePrompt(chatId, fromId)
    const answer = await getRespuestaAudioById(audioEditId)

    await sendTelegramMessage(
      chatId,
      ok && answer ? `Titulo actualizado ✅\n\n${answer.title}` : "No pude actualizar el titulo.",
      answer ? buildOwnerAnswerDetailKeyboard(answer.id, "owner:answers") : OWNER_ANSWERS_MENU_BUTTONS
    )
    return new Response("ok")
  }

  if (await hasActiveAudioSearchPrompt(chatId, fromId)) {
    await clearAudioSearchPrompt(chatId, fromId)
    const answers = await searchRespuestasAudioByTitle(text, 10)

    if (answers.length === 0) {
      await sendTelegramMessage(chatId, "No encontre respuestas con ese titulo.", OWNER_ANSWERS_MENU_BUTTONS)
      return new Response("ok")
    }

    await sendTelegramMessage(
      chatId,
      buildAnswerListText(`Busqueda: ${text}`, answers),
      buildOwnerAnswerListKeyboard(answers, "owner:answers")
    )
    return new Response("ok")
  }

  if (await hasActiveVideoSearchPrompt(chatId, fromId)) {
    await clearVideoSearchPrompt(chatId, fromId)
    const videos = await searchVideoSummariesByTitle(text, 10)

    if (videos.length === 0) {
      await sendTelegramMessage(chatId, "No encontre videos con ese titulo.", OWNER_VIDEOS_MENU_BUTTONS)
      return new Response("ok")
    }

    await sendTelegramMessage(
      chatId,
      buildVideoListText(`Busqueda: ${text}`, videos),
      buildOwnerVideoListKeyboard(videos, "owner:videos")
    )
    return new Response("ok")
  }

  return new Response("ok")
}
