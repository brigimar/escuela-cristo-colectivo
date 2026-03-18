import type { Metadata } from "next"
import { getLibraryBooks } from "@/features/library/data"
import { LibraryHero } from "@/features/library/components/LibraryHero"
import { LibraryFilters } from "@/features/library/components/LibraryFilters"
import { LibraryGrid } from "@/features/library/components/LibraryGrid"
import { LibraryEmptyState } from "@/features/library/components/LibraryEmptyState"

export const metadata: Metadata = {
  title: "Biblioteca | Escuela de Cristo",
  description: "Libros en PDF para lectura, estudio y descarga.",
}

type BibliotecaPageProps = {
  searchParams?: {
    title?: string
    author?: string
    category?: string
  }
}

function cleanParam(value: string | undefined): string {
  return (value || "").trim()
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("es-AR")
}

export default async function BibliotecaPage({ searchParams }: BibliotecaPageProps) {
  const selectedCategory = cleanParam(searchParams?.category)
  const selectedAuthor = cleanParam(searchParams?.author)
  const searchTitle = cleanParam(searchParams?.title)
  const titleQuery = normalize(searchTitle)

  const books = await getLibraryBooks()
  const categories = [...new Set(books.map((book) => book.category))].sort((a, b) => a.localeCompare(b, "es"))
  const authors = [...new Set(books.map((book) => book.author))].sort((a, b) => a.localeCompare(b, "es"))

  const filteredBooks = books.filter((book) => {
    if (selectedCategory && book.category !== selectedCategory) return false
    if (selectedAuthor && book.author !== selectedAuthor) return false
    if (titleQuery && !normalize(book.title).includes(titleQuery)) return false
    return true
  })

  return (
    <main className="min-h-screen bg-[#f7f1e4]">
      <LibraryHero totalBooks={books.length} />

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <LibraryFilters
          categories={categories}
          authors={authors}
          selectedCategory={selectedCategory}
          selectedAuthor={selectedAuthor}
          searchTitle={searchTitle}
        />

        {filteredBooks.length === 0 ? (
          <LibraryEmptyState
            title="Sin coincidencias"
            description="No encontramos libros con esos filtros. Proba con otra categoria, autor o titulo."
          />
        ) : (
          <LibraryGrid books={filteredBooks} />
        )}
      </section>
    </main>
  )
}
