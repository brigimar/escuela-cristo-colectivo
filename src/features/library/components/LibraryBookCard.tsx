import type { LibraryBook } from "@/features/library/models"
import { PREMIUM_CARD_BASE_CLASS, PREMIUM_CARD_INTERACTIVE_CLASS, PRIMARY_BUTTON_CLASS, premiumChipClass } from "@/features/home/components/ui"

type LibraryBookCardProps = {
  book: LibraryBook
}

export function LibraryBookCard({ book }: LibraryBookCardProps) {
  return (
    <article className={`flex h-full flex-col overflow-hidden ${PREMIUM_CARD_BASE_CLASS} ${PREMIUM_CARD_INTERACTIVE_CLASS}`}>
      <div className="border-b border-[#e3d3b4] bg-[#f4e7d2] p-4">
        <img
          src={book.cover_url}
          alt={`Portada de ${book.title}`}
          className="aspect-[2/3] w-full rounded-xl border border-[#d7c4a3] object-cover shadow-[0_10px_22px_rgba(70,48,18,0.12)]"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#5f5a4f]">
          <span className={premiumChipClass("warm")}>{book.category}</span>
          <span className={premiumChipClass("neutral")}>{book.author}</span>
        </div>

        <h2 className="min-h-[3.4rem] text-lg font-semibold leading-tight text-[#1f1a12]">{book.title}</h2>
        <p className="min-h-[4.4rem] text-sm leading-relaxed text-[#4b3f2d]">{book.description}</p>

        <div className="mt-auto pt-2">
          <a href={book.pdf_url} target="_blank" rel="noopener noreferrer" className={`${PRIMARY_BUTTON_CLASS} w-full`}>
            Descargar PDF
          </a>
        </div>
      </div>
    </article>
  )
}
