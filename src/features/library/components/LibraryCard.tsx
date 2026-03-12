import type { LibraryCardModel } from "@/features/library/view-models"
import { PREMIUM_CARD_BASE_CLASS, PREMIUM_CARD_INTERACTIVE_CLASS, PRIMARY_BUTTON_CLASS, premiumChipClass } from "@/features/home/components/ui"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "2-digit" })
}

type LibraryCardProps = {
  item: LibraryCardModel
}

export function LibraryCard({ item }: LibraryCardProps) {
  const createdAt = formatDate(item.createdAt)

  return (
    <article className={`overflow-hidden ${PREMIUM_CARD_BASE_CLASS} ${PREMIUM_CARD_INTERACTIVE_CLASS}`}>
      <div className="flex aspect-[4/3] items-center justify-center border-b border-[#e3d3b4] bg-[#f1e5cf]">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#7a6648]">PDF</p>
          <p className="mt-2 text-sm font-medium text-[#332714]">{item.author || "Escuela de Cristo"}</p>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <h2 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-tight text-[#1f1a12]">{item.title}</h2>
        <p className="text-sm text-[#5b4b35]">{item.author || "Autor no informado"}</p>
        {item.description ? <p className="line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-[#4b3f2d]">{item.description}</p> : null}

        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6d5a3f]">
          <span className={premiumChipClass("warm")}>{item.fileLabel}</span>
          {item.sizeLabel ? <span className={premiumChipClass("neutral")}>{item.sizeLabel}</span> : null}
          {createdAt ? <span className={premiumChipClass("ink")}>{createdAt}</span> : null}
        </div>

        <div className="pt-2">
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${PRIMARY_BUTTON_CLASS} w-full`}
          >
            Descargar PDF
          </a>
        </div>
      </div>
    </article>
  )
}
