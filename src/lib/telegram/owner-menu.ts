import type { EditorialTelegramCategory } from "@/features/videos/editorial-queries"

export type InlineKeyboardButton = {
  text: string
  callback_data: string
}

export type InlineKeyboardMarkup = {
  inline_keyboard: InlineKeyboardButton[][]
}

export const OWNER_MENU_TITLE = "Panel Owner - Escuela de Cristo"

export const OWNER_MAIN_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Recomendar video web", callback_data: "owner:recommend" }],
    [{ text: "Preguntas audiencia", callback_data: "owner:questions" }],
    [{ text: "Publicar audio", callback_data: "owner:audio" }],
    [{ text: "Respuestas publicadas", callback_data: "owner:answers" }],
    [{ text: "Lectura del dia", callback_data: "owner:reading" }],
    [{ text: "Libros / PDFs", callback_data: "owner:pdfs" }],
    [{ text: "Videos del canal", callback_data: "owner:videos" }],
    [{ text: "Estado del sistema", callback_data: "owner:status" }],
    [{ text: "Ayuda", callback_data: "owner:help" }],
  ],
}

export const OWNER_RECOMMEND_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Elegir categoria", callback_data: "owner:recommend:categories" }],
    [{ text: "Ver recomendado actual", callback_data: "owner:recommend:current" }],
    [
      { text: "Volver", callback_data: "owner:main" },
      { text: "Menu principal", callback_data: "owner:main" },
    ],
  ],
}

export const OWNER_RECOMMEND_CATEGORIES: Array<{
  slug: EditorialTelegramCategory
  title: string
}> = [
  { slug: "series-biblicas", title: "Series Biblicas" },
  { slug: "watchman-nee", title: "Watchman Nee" },
  { slug: "lives", title: "Lives" },
  { slug: "cortes", title: "Cortes" },
  { slug: "shorts", title: "Shorts" },
  { slug: "club-del-libro", title: "Club del Libro" },
  { slug: "reflexiones", title: "Reflexiones" },
  { slug: "ensenanzas", title: "Ensenanzas" },
]

export function buildOwnerMainMenuText() {
  return `${OWNER_MENU_TITLE}\n\nElegi una seccion para continuar.`
}

export function buildOwnerRecommendMenuText() {
  return "Recomendar video web\n\nElegi una accion."
}

export function buildOwnerAudioText() {
  return [
    "Publicar audio",
    "",
    "Flujo real disponible:",
    "- inicia la carga desde este menu",
    "- envia un voice o archivo de audio",
    "- el bot te pide el titulo",
    "- confirma la publicacion",
    "- guarda el audio en Storage y en respuestas_audio",
  ].join("\n")
}

export function buildOwnerQuestionsText() {
  return [
    "Preguntas audiencia",
    "",
    "Funciones reales disponibles:",
    "- ver preguntas pendientes",
    "- ver preguntas seleccionadas",
    "- ver preguntas ocultas",
    "- seleccionar, ocultar y restaurar",
    "- ver detalle de cada pregunta",
  ].join("\n")
}

export function buildOwnerAudioAwaitingFileText() {
  return [
    "Publicar audio",
    "",
    "Paso 1 de 3",
    "Envia ahora un voice de Telegram o un archivo de audio.",
    "",
    "Puedes cancelar la carga desde el boton Cancelar carga.",
  ].join("\n")
}

export function buildOwnerAudioAwaitingTitleText() {
  return [
    "Publicar audio",
    "",
    "Paso 2 de 3",
    "Audio recibido correctamente.",
    "Ahora responde con el titulo que quieres publicar.",
  ].join("\n")
}

export function buildOwnerAudioConfirmText(params: { title: string; sourceKind: string; mimeType: string | null }) {
  return [
    "Publicar audio",
    "",
    "Paso 3 de 3",
    `Titulo: ${params.title}`,
    `Tipo: ${params.sourceKind === "voice" ? "Voice" : "Archivo de audio"}`,
    `Mime: ${params.mimeType || "—"}`,
    "",
    "Confirma para publicar.",
  ].join("\n")
}

export function buildOwnerVideosText() {
  return [
    "Videos del canal",
    "",
    "Funciones reales disponibles:",
    "- ver categorias editoriales",
    "- ver ultimos videos sincronizados",
    "- buscar por titulo",
    "- ver detalle y clasificacion editorial",
    "- ver videos sin series_collection",
  ].join("\n")
}

export function buildOwnerAnswersText() {
  return [
    "Respuestas publicadas",
    "",
    "Funciones reales disponibles:",
    "- ver ultimas respuestas",
    "- buscar por titulo",
    "- ver detalle",
    "- editar titulo",
  ].join("\n")
}

export function buildOwnerReadingText() {
  return [
    "Lectura del dia",
    "",
    "Funciones reales disponibles:",
    "- ver lectura actual",
    "- crear o reemplazar lectura",
    "- editar lectura actual",
    "- confirmar publicacion",
  ].join("\n")
}

export function buildOwnerPdfsText() {
  return [
    "Libros / PDFs",
    "",
    "Funciones reales disponibles:",
    "- ver libros publicados",
    "- ver libros ocultos",
    "- subir nuevo PDF",
    "- ver detalle",
    "- ocultar y restaurar",
  ].join("\n")
}

export function buildOwnerStatusText(params: {
  videosCount: number
  pendingQuestionsCount: number
  audiosCount: number
  latestSyncSource: string | null
  latestSyncStatus: string | null
  latestSyncStartedAt: string | null
  recommendedTitle: string | null
  recommendedYoutubeId: string | null
}) {
  return [
    "Estado del sistema",
    "",
    `Videos: ${params.videosCount}`,
    `Preguntas pendientes: ${params.pendingQuestionsCount}`,
    `Audios publicados: ${params.audiosCount}`,
    `Ultimo sync: ${params.latestSyncSource || "—"} / ${params.latestSyncStatus || "—"}`,
    `Inicio ultimo sync: ${params.latestSyncStartedAt ? params.latestSyncStartedAt.slice(0, 19).replace("T", " ") : "—"}`,
    `Recomendado actual: ${params.recommendedTitle || "—"}`,
    `ID recomendado: ${params.recommendedYoutubeId || "—"}`,
  ].join("\n")
}

export function buildOwnerHelpText() {
  return [
    "Ayuda",
    "",
    "Como recomendar un video:",
    "- usa /menu",
    "- entra en Recomendar video web",
    "- elige categoria, video y confirma",
    "",
    "Como publicar un audio:",
    "- envia un voice o archivo al bot",
    "- responde con el titulo cuando lo pida",
    "",
    "Comandos disponibles:",
    "- /menu",
    "- /recomendado",
    "- /recomendar <youtube_video_id>",
    "- /listar-videos <categoria> [offset]",
    "- /recomendado-web <numero>",
    "- /audios",
  ].join("\n")
}

export function buildOwnerRecommendCategoriesKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      ...OWNER_RECOMMEND_CATEGORIES.map((item) => [
        { text: item.title, callback_data: `owner:recommend:list:${item.slug}:0` },
      ]),
      [
        { text: "Volver", callback_data: "owner:recommend" },
        { text: "Menu principal", callback_data: "owner:main" },
      ],
    ],
  }
}

export function buildOwnerSimpleBackKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "Volver", callback_data: "owner:main" },
        { text: "Menu principal", callback_data: "owner:main" },
      ],
    ],
  }
}

export const OWNER_AUDIO_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Iniciar carga de audio", callback_data: "owner:audio:start" }],
    [{ text: "Ver respuestas publicadas", callback_data: "owner:audio:list" }],
    [{ text: "Cancelar carga", callback_data: "owner:audio:cancel" }],
    [{ text: "Menu principal", callback_data: "owner:main" }],
  ],
}

export const OWNER_QUESTIONS_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Ver pendientes", callback_data: "owner:questions:pending" }],
    [{ text: "Ver seleccionadas", callback_data: "owner:questions:selected" }],
    [{ text: "Ver ocultas", callback_data: "owner:questions:hidden" }],
    [{ text: "Menu principal", callback_data: "owner:main" }],
  ],
}

export const OWNER_AUDIO_AWAITING_FILE_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Cancelar carga", callback_data: "owner:audio:cancel" }],
    [{ text: "Menu principal", callback_data: "owner:main" }],
  ],
}

export const OWNER_AUDIO_CONFIRM_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Confirmar publicacion", callback_data: "owner:audio:confirm" }],
    [{ text: "Cancelar carga", callback_data: "owner:audio:cancel" }],
    [{ text: "Menu principal", callback_data: "owner:main" }],
  ],
}

export const OWNER_VIDEOS_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Ver categorias", callback_data: "owner:videos:categories" }],
    [{ text: "Ver ultimos videos", callback_data: "owner:videos:latest" }],
    [{ text: "Buscar por titulo", callback_data: "owner:videos:search" }],
    [{ text: "Ver videos sin clasificar", callback_data: "owner:videos:unclassified" }],
    [{ text: "Menu principal", callback_data: "owner:main" }],
  ],
}

export const OWNER_ANSWERS_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Ver ultimas respuestas", callback_data: "owner:answers:latest" }],
    [{ text: "Buscar respuesta", callback_data: "owner:answers:search" }],
    [{ text: "Menu principal", callback_data: "owner:main" }],
  ],
}

export const OWNER_READING_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Ver lectura actual", callback_data: "owner:reading:current" }],
    [{ text: "Crear o reemplazar lectura", callback_data: "owner:reading:create" }],
    [{ text: "Editar lectura actual", callback_data: "owner:reading:edit" }],
    [{ text: "Menu principal", callback_data: "owner:main" }],
  ],
}

export const OWNER_PDFS_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Ver libros publicados", callback_data: "owner:pdfs:published" }],
    [{ text: "Ver libros ocultos", callback_data: "owner:pdfs:hidden" }],
    [{ text: "Subir nuevo PDF", callback_data: "owner:pdfs:start" }],
    [{ text: "Volver", callback_data: "owner:main" }],
  ],
}

export function buildOwnerVideosSearchText() {
  return [
    "Videos del canal",
    "",
    "Envia ahora un texto para buscar por titulo.",
    "",
    "Ejemplo: Mateo 20",
  ].join("\n")
}

export function buildOwnerAnswersSearchText() {
  return [
    "Respuestas publicadas",
    "",
    "Envia ahora un texto para buscar por titulo.",
    "",
    "Ejemplo: Oracion",
  ].join("\n")
}

export function buildOwnerReadingEditorText(params: {
  mode: "create" | "edit"
  title: string
  content_md: string
  reference_text: string
  author: string
  awaitingField?: "title" | "content_md" | "reference_text" | "author" | null
}) {
  const fieldHint =
    params.awaitingField === "title"
      ? "Envia ahora el titulo."
      : params.awaitingField === "content_md"
        ? "Envia ahora el contenido completo."
        : params.awaitingField === "reference_text"
          ? "Envia ahora la referencia opcional."
          : params.awaitingField === "author"
            ? "Envia ahora el autor opcional."
            : "Completa o revisa los campos y confirma."

  return [
    params.mode === "edit" ? "Editar lectura del dia" : "Crear lectura del dia",
    "",
    `Titulo: ${params.title || "—"}`,
    `Contenido: ${params.content_md ? `${params.content_md.length} caracteres` : "—"}`,
    `Referencia: ${params.reference_text || "—"}`,
    `Autor: ${params.author || "—"}`,
    "",
    fieldHint,
  ].join("\n")
}

export function buildOwnerPdfAwaitingFileText() {
  return [
    "Libros / PDFs",
    "",
    "Paso 1 de 4",
    "Envia ahora un archivo PDF.",
    "",
    "Solo se acepta application/pdf.",
  ].join("\n")
}

export function buildOwnerPdfDraftEditorText(params: {
  title: string
  description: string
  author: string
  hasFile: boolean
  awaitingField: "title" | "description" | "author" | null
}) {
  const hint =
    params.awaitingField === "title"
      ? "Envia ahora el titulo."
      : params.awaitingField === "description"
        ? "Envia ahora la descripcion. Usa - para vaciar."
        : params.awaitingField === "author"
          ? "Envia ahora el autor. Usa - para vaciar."
          : "Edita campos y confirma."

  return [
    "Libros / PDFs",
    "",
    "Editor de borrador",
    `Archivo PDF: ${params.hasFile ? "Recibido ✅" : "Falta PDF"}`,
    `Titulo: ${params.title || "—"}`,
    `Descripcion: ${params.description || "—"}`,
    `Autor: ${params.author || "—"}`,
    "",
    hint,
  ].join("\n")
}

export function buildOwnerPdfDraftEditorKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "Editar titulo", callback_data: "owner:pdfs:draft:field:title" }],
      [{ text: "Editar descripcion", callback_data: "owner:pdfs:draft:field:description" }],
      [{ text: "Editar autor", callback_data: "owner:pdfs:draft:field:author" }],
      [{ text: "Confirmar publicacion", callback_data: "owner:pdfs:confirm" }],
      [{ text: "Cancelar carga", callback_data: "owner:pdfs:cancel" }],
      [
        { text: "Volver", callback_data: "owner:pdfs" },
        { text: "Menu principal", callback_data: "owner:main" },
      ],
    ],
  }
}

export function buildOwnerVideoListKeyboard(
  items: Array<{ youtube_video_id: string; title: string }>,
  backCallback: string
): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = items.map((item, index) => [
    {
      text: `${index + 1}. ${item.title.slice(0, 50)}`,
      callback_data: `owner:videos:detail:${item.youtube_video_id}`,
    },
  ])

  rows.push([
    { text: "Volver", callback_data: backCallback },
    { text: "Menu principal", callback_data: "owner:main" },
  ])

  return { inline_keyboard: rows }
}

export function buildOwnerQuestionListKeyboard(
  items: Array<{ id: string; author_name?: string | null; text_display?: string | null }>,
  listType: "pending" | "selected" | "hidden",
  params?: { offset: number; pageSize: number; hasNext: boolean }
): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = []
  const offset = params?.offset ?? 0

  items.forEach((item, index) => {
    rows.push([
      {
        text: `${index + 1}. ${(item.author_name || "Anonimo").slice(0, 18)} - ${(item.text_display || "Sin texto").slice(0, 28)}`,
        callback_data: `owner:questions:detail:${item.id}:${listType}`,
      },
    ])

    if (listType === "pending") {
      rows.push([
        { text: "Seleccionar", callback_data: `owner:qaction:pending:select:${item.id}:${offset}` },
        { text: "Ocultar", callback_data: `owner:qaction:pending:hide:${item.id}:${offset}` },
      ])
    } else if (listType === "selected") {
      rows.push([
        { text: "Quitar selección", callback_data: `owner:qaction:selected:unselect:${item.id}:${offset}` },
        { text: "Ocultar", callback_data: `owner:qaction:selected:hide:${item.id}:${offset}` },
      ])
    } else {
      rows.push([{ text: "Restaurar", callback_data: `owner:qaction:hidden:restore:${item.id}:${offset}` }])
    }
  })

  if (params) {
    const navRow: InlineKeyboardButton[] = []
    if (params.offset > 0) {
      const prevOffset = Math.max(0, params.offset - params.pageSize)
      navRow.push({ text: "Anterior", callback_data: `owner:questions:${listType}:${prevOffset}` })
    }
    if (params.hasNext) {
      const nextOffset = params.offset + params.pageSize
      navRow.push({ text: "Siguiente", callback_data: `owner:questions:${listType}:${nextOffset}` })
    }
    if (navRow.length) rows.push(navRow)
  }

  rows.push([{ text: "Menu principal", callback_data: "owner:main" }])

  return { inline_keyboard: rows }
}

export function buildOwnerQuestionDetailKeyboard(
  questionId: string,
  listType: "pending" | "selected" | "hidden",
  state: { isSelected: boolean; isHidden: boolean }
): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = []

  if (state.isHidden) {
    rows.push([{ text: "Restaurar pregunta", callback_data: `owner:questions:restore:${questionId}:${listType}` }])
  } else {
    if (!state.isSelected) {
      rows.push([{ text: "Seleccionar pregunta", callback_data: `owner:questions:select:${questionId}:${listType}` }])
    }
    rows.push([{ text: "Ocultar pregunta", callback_data: `owner:questions:hide:${questionId}:${listType}` }])
  }

  rows.push([
    { text: "Volver", callback_data: `owner:questions:${listType}` },
    { text: "Menu principal", callback_data: "owner:main" },
  ])

  return { inline_keyboard: rows }
}

export function buildOwnerAnswerListKeyboard(
  items: Array<{ id: string; title: string }>,
  backCallback: string
): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = items.map((item, index) => [
    {
      text: `${index + 1}. ${item.title.slice(0, 50)}`,
      callback_data: `owner:answers:detail:${item.id}`,
    },
  ])

  rows.push([
    { text: "Volver", callback_data: backCallback },
    { text: "Menu principal", callback_data: "owner:main" },
  ])

  return { inline_keyboard: rows }
}

export function buildOwnerAnswerDetailKeyboard(answerId: string, backCallback: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "Editar titulo", callback_data: `owner:answers:edit-title:${answerId}` }],
      [
        { text: "Volver", callback_data: backCallback },
        { text: "Menu principal", callback_data: "owner:main" },
      ],
    ],
  }
}

export function buildOwnerReadingEditorKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "Editar titulo", callback_data: "owner:reading:field:title" }],
      [{ text: "Editar contenido", callback_data: "owner:reading:field:content_md" }],
      [{ text: "Editar referencia", callback_data: "owner:reading:field:reference_text" }],
      [{ text: "Editar autor", callback_data: "owner:reading:field:author" }],
      [{ text: "Confirmar publicacion", callback_data: "owner:reading:confirm" }],
      [
        { text: "Volver", callback_data: "owner:reading" },
        { text: "Menu principal", callback_data: "owner:main" },
      ],
    ],
  }
}

export function buildOwnerPdfListKeyboard(
  items: Array<{ id: string; title: string }>,
  backCallback: "owner:pdfs:published" | "owner:pdfs:hidden" | "owner:pdfs"
): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = items.map((item, index) => [
    {
      text: `${index + 1}. ${item.title.slice(0, 50)}`,
      callback_data: `owner:pdfs:detail:${item.id}:${backCallback}`,
    },
  ])

  rows.push([
    { text: "Volver", callback_data: backCallback },
    { text: "Menu principal", callback_data: "owner:main" },
  ])

  return { inline_keyboard: rows }
}

export function buildOwnerPdfDetailKeyboard(
  pdfId: string,
  isPublished: boolean,
  backCallback: "owner:pdfs:published" | "owner:pdfs:hidden" | "owner:pdfs"
): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = []
  rows.push([{ text: "Editar titulo", callback_data: `owner:pdfs:edit:title:${pdfId}:${backCallback}` }])
  rows.push([{ text: "Editar descripcion", callback_data: `owner:pdfs:edit:description:${pdfId}:${backCallback}` }])
  rows.push([{ text: "Editar autor", callback_data: `owner:pdfs:edit:author:${pdfId}:${backCallback}` }])
  rows.push([
    {
      text: isPublished ? "Ocultar libro" : "Restaurar libro",
      callback_data: isPublished ? `owner:pdfs:hide:${pdfId}` : `owner:pdfs:restore:${pdfId}`,
    },
  ])
  rows.push([
    { text: "Volver", callback_data: backCallback },
    { text: "Menu principal", callback_data: "owner:main" },
  ])
  return { inline_keyboard: rows }
}

export const OWNER_PDF_AWAITING_FILE_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Cancelar carga", callback_data: "owner:pdfs:cancel" }],
    [{ text: "Menu principal", callback_data: "owner:main" }],
  ],
}

export const OWNER_PDF_CONFIRM_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Confirmar publicacion", callback_data: "owner:pdfs:confirm" }],
    [{ text: "Cancelar carga", callback_data: "owner:pdfs:cancel" }],
    [{ text: "Menu principal", callback_data: "owner:main" }],
  ],
}

export function buildOwnerVideoDetailKeyboard(youtubeVideoId: string, backCallback: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "Ver clasificacion editorial", callback_data: `owner:videos:classification:${youtubeVideoId}` }],
      [
        { text: "Volver", callback_data: backCallback },
        { text: "Menu principal", callback_data: "owner:main" },
      ],
    ],
  }
}

export function buildOwnerVideoClassificationKeyboard(youtubeVideoId: string, backCallback: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "Ver detalle de video", callback_data: `owner:videos:detail:${youtubeVideoId}` }],
      [
        { text: "Volver", callback_data: backCallback },
        { text: "Menu principal", callback_data: "owner:main" },
      ],
    ],
  }
}

export const OWNER_STATUS_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [[{ text: "Menu principal", callback_data: "owner:main" }]],
}

export const OWNER_HELP_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [[{ text: "Menu principal", callback_data: "owner:main" }]],
}

export function buildOwnerRecommendVideoListKeyboard(
  categorySlug: EditorialTelegramCategory,
  items: Array<{ youtube_video_id: string; title: string }>,
  offset: number,
  showNext: boolean
): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = items.map((item, index) => [
    {
      text: `${offset + index + 1}. ${item.title.slice(0, 50)}`,
      callback_data: `owner:recommend:pick:${item.youtube_video_id}`,
    },
  ])

  const navRow: InlineKeyboardButton[] = []
  if (offset > 0) navRow.push({ text: "Anterior", callback_data: `owner:recommend:list:${categorySlug}:${Math.max(0, offset - 10)}` })
  if (showNext) navRow.push({ text: "Ver mas", callback_data: `owner:recommend:list:${categorySlug}:${offset + 10}` })
  if (navRow.length) rows.push(navRow)

  rows.push([
    { text: "Elegir categoria", callback_data: "owner:recommend:categories" },
    { text: "Menu principal", callback_data: "owner:main" },
  ])

  return { inline_keyboard: rows }
}

export function buildOwnerRecommendConfirmKeyboard(youtubeVideoId: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "Confirmar publicacion", callback_data: `owner:recommend:confirm:${youtubeVideoId}` }],
      [{ text: "Cancelar", callback_data: "owner:recommend" }],
      [
        { text: "Elegir categoria", callback_data: "owner:recommend:categories" },
        { text: "Menu principal", callback_data: "owner:main" },
      ],
    ],
  }
}

export function buildOwnerRecommendCurrentKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "Elegir categoria", callback_data: "owner:recommend:categories" },
        { text: "Volver", callback_data: "owner:recommend" },
      ],
      [{ text: "Menu principal", callback_data: "owner:main" }],
    ],
  }
}
