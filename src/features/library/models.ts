export type LibraryBook = {
  id: string
  // Campos gestionados desde el bot de Telegram
  title: string
  author: string
  category: string
  description: string
  cover_url: string
  pdf_url: string
  is_published: boolean
  is_hidden: boolean
  is_featured: boolean
  sort_order: number
}
