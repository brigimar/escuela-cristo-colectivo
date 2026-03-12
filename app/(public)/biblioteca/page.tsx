import Link from "next/link"
import type { Metadata } from "next"
import { listPublishedLibraryPdfsPage } from "@/features/library/queries"
import { toLibraryCardModel } from "@/features/library/view-models"
import { LibraryHero } from "@/features/library/components/LibraryHero"
import { LibraryGrid } from "@/features/library/components/LibraryGrid"
import { LibraryEmptyState } from "@/features/library/components/LibraryEmptyState"

export const metadata: Metadata = {
  title: "Biblioteca | Escuela de Cristo",
  description: "Libros en PDF para lectura, estudio y descarga.",
}

type BibliotecaPageProps = {
  searchParams?: {
    q?: string
    page?: string
  }
}

const PAGE_SIZE = 12

function parsePage(raw: string | undefined) {
  const page = Number(raw || "1")
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

function buildHref(page: number, q: string) {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))
  const query = params.toString()
  return query ? `/biblioteca?${query}` : "/biblioteca"
}

export default async function BibliotecaPage({ searchParams }: BibliotecaPageProps) {
  const q = (searchParams?.q || "").trim()
  const page = parsePage(searchParams?.page)
  const result = await listPublishedLibraryPdfsPage({ page, pageSize: PAGE_SIZE, query: q })
  const cards = result.items.map(toLibraryCardModel)
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <main className="min-h-screen bg-[#f7f1e4]">
      <LibraryHero totalBooks={result.total} />

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <form method="GET" action="/biblioteca" className="mb-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por título o autor"
            className="w-full rounded-xl border border-[#cdb58d] bg-[#fffaf0] px-4 py-3 text-sm text-[#2b2114] outline-none transition-colors placeholder:text-[#7a6648] focus:border-[#866a44]"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-[#2f2314] px-5 py-3 text-sm font-medium text-[#f8efdc] transition-colors hover:bg-[#22180e]"
          >
            Buscar
          </button>
        </form>

        {cards.length === 0 ? <LibraryEmptyState /> : <LibraryGrid items={cards} />}

        <div className="mt-8 flex items-center justify-between">
          <Link
            href={canPrev ? buildHref(page - 1, q) : "#"}
            aria-disabled={!canPrev}
            className={`rounded-xl border px-4 py-2 text-sm ${canPrev ? "border-[#cdb58d] bg-[#fffaf0] text-[#2b2114] hover:bg-[#f3e7d1]" : "border-[#dfd1b8] bg-[#f5ecdd] text-[#a28b67] pointer-events-none"}`}
          >
            Anterior
          </Link>
          <p className="text-sm text-[#5b4b35]">
            Página {Math.min(page, totalPages)} de {totalPages}
          </p>
          <Link
            href={canNext ? buildHref(page + 1, q) : "#"}
            aria-disabled={!canNext}
            className={`rounded-xl border px-4 py-2 text-sm ${canNext ? "border-[#cdb58d] bg-[#fffaf0] text-[#2b2114] hover:bg-[#f3e7d1]" : "border-[#dfd1b8] bg-[#f5ecdd] text-[#a28b67] pointer-events-none"}`}
          >
            Ver más
          </Link>
        </div>
      </section>
    </main>
  )
}
