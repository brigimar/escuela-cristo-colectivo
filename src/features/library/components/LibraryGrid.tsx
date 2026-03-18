import { LibraryBookCard } from "@/features/library/components/LibraryBookCard"
import type { LibraryBook } from "@/features/library/models"

type LibraryGridProps = {
  books: LibraryBook[]
}

export function LibraryGrid({ books }: LibraryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <LibraryBookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
