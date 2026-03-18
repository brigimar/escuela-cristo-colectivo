import type { LibraryBook } from "@/features/library/models"
import { listPublishedLibraryPdfs } from "@/features/library/queries"

const DEFAULT_LIBRARY_COVER_URL = "/images/library/library-default-cover.svg"

function toLibraryBook(item: Awaited<ReturnType<typeof listPublishedLibraryPdfs>>[number]): LibraryBook {
  return {
    id: item.id,
    title: item.title,
    author: item.author?.trim() || "Escuela de Cristo",
    category: item.category?.trim() || "General",
    description: item.description?.trim() || "Lectura disponible en la biblioteca de Escuela de Cristo.",
    cover_url: item.cover_url?.trim() || DEFAULT_LIBRARY_COVER_URL,
    pdf_url: item.public_url?.trim() || "",
    is_published: item.is_published,
    is_hidden: item.is_hidden,
    is_featured: item.is_featured,
    sort_order: item.sort_order,
  }
}

export async function getLibraryBooks(): Promise<LibraryBook[]> {
  const items = await listPublishedLibraryPdfs(500)

  return items
    .filter((item) => Boolean(item.public_url))
    .map(toLibraryBook)
}
