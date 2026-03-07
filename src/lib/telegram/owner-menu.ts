import type { EditorialTelegramCategory } from "@/features/videos/editorial-queries"

export type InlineKeyboardButton = {
  text: string
  callback_data: string
}

export type InlineKeyboardMarkup = {
  inline_keyboard: InlineKeyboardButton[][]
}

type PlaceholderSection = {
  key: string
  title: string
  lines: string[]
}

export const OWNER_MENU_TITLE = "Panel Owner - Escuela de Cristo"

export const OWNER_MAIN_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Recomendar video web", callback_data: "owner:recommend" }],
    [{ text: "Preguntas audiencia", callback_data: "owner:placeholder:questions" }],
    [{ text: "Publicar audio", callback_data: "owner:placeholder:audio" }],
    [{ text: "Lectura del dia", callback_data: "owner:placeholder:reading" }],
    [{ text: "Libros / PDFs", callback_data: "owner:placeholder:pdfs" }],
    [{ text: "Videos del canal", callback_data: "owner:placeholder:videos" }],
    [{ text: "Respuestas publicadas", callback_data: "owner:placeholder:answers" }],
    [{ text: "Estado del sistema", callback_data: "owner:placeholder:status" }],
    [{ text: "Ayuda", callback_data: "owner:placeholder:help" }],
  ],
}

export const OWNER_RECOMMEND_MENU_BUTTONS: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: "Elegir categoria", callback_data: "owner:recommend:categories" }],
    [{ text: "Ver recomendado actual", callback_data: "owner:recommend:current" }],
    [{ text: "Quitar recomendado", callback_data: "owner:placeholder:remove_recommendation" }],
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

export const OWNER_PLACEHOLDER_SECTIONS: PlaceholderSection[] = [
  {
    key: "questions",
    title: "Preguntas audiencia",
    lines: [
      "Ver preguntas pendientes",
      "Ver preguntas seleccionadas",
      "Seleccionar pregunta",
      "Ocultar pregunta",
      "Restaurar pregunta",
      "Marcar como respondida",
      "Ver detalle de pregunta",
      "Ver mas preguntas",
    ],
  },
  {
    key: "audio",
    title: "Publicar audio",
    lines: [
      "Responder pregunta seleccionada",
      "Subir voice de Telegram",
      "Subir archivo de audio",
      "Escribir titulo del audio",
      "Confirmar publicacion",
      "Ver respuestas publicadas",
      "Cancelar carga",
    ],
  },
  {
    key: "reading",
    title: "Lectura del dia",
    lines: [
      "Crear nueva lectura",
      "Editar lectura actual",
      "Ver lectura publicada",
      "Programar texto base",
      "Quitar lectura actual",
      "Confirmar publicacion",
    ],
  },
  {
    key: "pdfs",
    title: "Libros / PDFs",
    lines: [
      "Subir nuevo PDF",
      "Escribir titulo",
      "Escribir descripcion breve",
      "Confirmar publicacion",
      "Ver libros publicados",
      "Ocultar libro",
      "Restaurar libro",
      "Eliminar de publicacion",
    ],
  },
  {
    key: "videos",
    title: "Videos del canal",
    lines: [
      "Ver categorias",
      "Ver ultimos videos",
      "Buscar por titulo",
      "Ver detalle de video",
      "Ver clasificacion editorial",
      "Ver videos sin clasificar",
    ],
  },
  {
    key: "answers",
    title: "Respuestas publicadas",
    lines: [
      "Ver ultimas respuestas",
      "Buscar respuesta",
      "Editar titulo",
      "Ocultar respuesta",
      "Restaurar respuesta",
      "Marcar destacada",
    ],
  },
  {
    key: "status",
    title: "Estado del sistema",
    lines: [
      "Ver ultimo sync de YouTube",
      "Ver cantidad de videos",
      "Ver recomendado actual",
      "Ver preguntas pendientes",
      "Ver audios publicados",
      "Ver lectura actual",
      "Ver estado general",
    ],
  },
  {
    key: "help",
    title: "Ayuda",
    lines: [
      "Como recomendar un video",
      "Como publicar un audio",
      "Como publicar lectura del dia",
      "Como subir un PDF",
      "Comandos disponibles",
    ],
  },
  {
    key: "remove_recommendation",
    title: "Quitar recomendado",
    lines: [
      "Placeholder temporal.",
      "La opcion queda visible y navegable, pero todavia no borra el recomendado actual.",
    ],
  },
]

export function buildOwnerMainMenuText() {
  return `${OWNER_MENU_TITLE}\n\nElegi una seccion para continuar.`
}

export function buildOwnerRecommendMenuText() {
  return "Recomendar video web\n\nElegi una accion."
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

export function buildOwnerPlaceholderText(key: string) {
  const section = OWNER_PLACEHOLDER_SECTIONS.find((item) => item.key === key)
  if (!section) return "Seccion no disponible."

  return `${section.title}\n\n${section.lines.map((line) => `- ${line}`).join("\n")}\n\nDisponible proximamente.`
}

export function buildOwnerPlaceholderKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "Volver", callback_data: "owner:main" },
        { text: "Menu principal", callback_data: "owner:main" },
      ],
    ],
  }
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
