import { loadServerEnv } from "@/lib/env/server"
import { setVideoRecommendationByYoutubeId } from "@/features/recommendation/queries"
import {
  getActiveTelegramEditorialListContext,
  getTelegramEditorialCategory,
  listVideosByTelegramEditorialCategory,
  saveTelegramEditorialListContext,
  TELEGRAM_EDITORIAL_CATEGORIES,
} from "@/features/videos/editorial-queries"
import { supabaseService } from "@/lib/supabase/client-service"

type TelegramMessage = {
  chat?: { id?: number }
  from?: { id?: number; username?: string }
  text?: string
  voice?: { file_id?: string; file_unique_id?: string; mime_type?: string; file_size?: number }
  audio?: { file_id?: string; file_unique_id?: string; mime_type?: string; file_size?: number }
}

type TelegramUpdate = {
  message?: TelegramMessage
}

async function sendTelegramMessage(chatId: number, text: string) {
  const { TELEGRAM_BOT_TOKEN } = loadServerEnv()
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN")
  }

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Telegram sendMessage failed: ${res.status} ${body}`)
  }
}

function formatTelegramDate(value: string | null) {
  return value ? value.slice(0, 10) : "—"
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
  const text = typeof msg?.text === "string" ? msg.text.trim() : ""
  const chatId = typeof msg?.chat?.id === "number" ? msg.chat.id : null
  const fromId = typeof msg?.from?.id === "number" ? msg.from.id : null
  const fromUsername = typeof msg?.from?.username === "string" ? msg.from.username : null
  const voice = msg?.voice
  const audio = msg?.audio

  if (!chatId || !fromId) return new Response("ok")

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
      text.startsWith("/recomendado-web")
    if (!supportedCommand) {
      const pendingForTitle = await supabaseService
        .from("telegram_pending_audio")
        .select("chat_id")
        .eq("chat_id", chatId)
        .eq("from_id", fromId)
        .maybeSingle()

      if (!pendingForTitle.error && pendingForTitle.data) {
        // Hay pending activo: dejar que el flujo de publicación procese este texto como título.
      } else {
        await sendTelegramMessage(chatId, "Recibido ✅")
        return new Response("ok")
      }
    }
  }

  if (!isOwner(fromId)) {
    if (text.startsWith("/recomendar") || text.startsWith("/audios") || text.startsWith("/recomendado-web") || voice || audio) {
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
      }, { onConflict: "chat_id" })

    await sendTelegramMessage(chatId, "Perfecto. Enviame el título del audio.")
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

  if (text.startsWith("/listar-categorias")) {
    const lines = TELEGRAM_EDITORIAL_CATEGORIES.map((item, index) => `${index + 1}. ${item.label}`)
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

    await sendTelegramMessage(
      chatId,
      `Recomendado web actualizado:\n${selected.index}. ${selected.title}\nID: ${selected.youtube_video_id}`
    )
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

    await sendTelegramMessage(chatId, "Video recomendado actualizado ✅")
    return new Response("ok")
  }

  const pending = await supabaseService
    .from("telegram_pending_audio")
    .select("chat_id, from_id, file_id, file_unique_id, source_kind, mime_type, size_bytes")
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .maybeSingle()

  if (!pending.error && pending.data) {
    const title = text.trim()
    if (!title) {
      await sendTelegramMessage(chatId, "Enviame un título válido para publicar el audio.")
      return new Response("ok")
    }

    const filePath = await getTelegramFilePath(pending.data.file_id)
    if (!filePath) {
      await sendTelegramMessage(chatId, "No pude obtener el archivo desde Telegram.")
      return new Response("ok")
    }

    const bytes = await downloadTelegramFile(filePath)
    if (!bytes) {
      await sendTelegramMessage(chatId, "No pude descargar el archivo desde Telegram.")
      return new Response("ok")
    }

    const now = new Date()
    const yyyy = String(now.getUTCFullYear())
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
    const ext = extensionFromMime(pending.data.mime_type, pending.data.source_kind)
    const uuid = crypto.randomUUID()
    const bucket = "respuestas-audio"
    const storagePath = `${yyyy}/${mm}/${uuid}.${ext}`
    const contentType = pending.data.mime_type || (pending.data.source_kind === "voice" ? "audio/ogg" : "application/octet-stream")

    const upload = await supabaseService.storage
      .from(bucket)
      .upload(storagePath, bytes, { contentType, upsert: false })

    if (upload.error) {
      await sendTelegramMessage(chatId, "No pude subir el audio a Storage.")
      return new Response("ok")
    }

    const publicUrlData = supabaseService.storage.from(bucket).getPublicUrl(storagePath)
    const publicUrl = publicUrlData?.data?.publicUrl ?? null
    const createdBy = fromUsername ? `@${fromUsername}` : `tg:${fromId}`

    const insertRes = await supabaseService
      .from("respuestas_audio")
      .insert({
        title,
        storage_bucket: bucket,
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: pending.data.mime_type,
        size_bytes: pending.data.size_bytes,
        created_by: createdBy,
      })

    if (insertRes.error) {
      await sendTelegramMessage(chatId, "No pude guardar metadata del audio.")
      return new Response("ok")
    }

    await supabaseService.from("telegram_pending_audio").delete().eq("chat_id", chatId)
    await sendTelegramMessage(chatId, "Publicado ✅")
    return new Response("ok")
  }

  return new Response("ok")
}
