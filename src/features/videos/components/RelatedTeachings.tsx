import Link from "next/link"
import type { RelatedVideoItem } from "@/features/videos/queries"
import { PREMIUM_CARD_BASE_CLASS, PREMIUM_CARD_INTERACTIVE_CLASS, premiumChipClass } from "@/features/home/components/ui"
import { excerpt } from "@/lib/text/excerpt"

function formatDateLabel(value: string | null): string {
  if (!value) return "Sin fecha"
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(value))
}

type RelatedTeachingsProps = {
  items: RelatedVideoItem[]
}

export function RelatedTeachings({ items }: RelatedTeachingsProps) {
  if (items.length === 0) return null

  return (
    <section className="mt-6 rounded-3xl border border-[#dccbac] bg-[linear-gradient(180deg,#fffdf9_0%,#fbf4e6_100%)] p-5 shadow-[0_10px_28px_rgba(62,44,16,0.10)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6a11]">Continuidad editorial</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#1f1a12]">Ensenanzas relacionadas</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5a4c34]">
            Seleccionadas por serie, categoria editorial y afinidad con la ensenanza actual.
          </p>
        </div>
        <Link href="/videos" className="text-sm font-medium text-[#8f6a11] transition-colors hover:text-[#6c4f0d]">
          Ver todas
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.slug} className={`overflow-hidden ${PREMIUM_CARD_BASE_CLASS} ${PREMIUM_CARD_INTERACTIVE_CLASS}`}>
            <Link href={item.url} className="block">
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  loading="lazy"
                  className="aspect-video w-full border-b border-[#e3d3b4] object-cover"
                />
              ) : (
                <div className="aspect-video w-full border-b border-[#e3d3b4] bg-[#eadcc3]" />
              )}

              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5f5a4f]">
                  <span className={premiumChipClass("warm")}>{item.category}</span>
                  <span className={premiumChipClass("neutral")}>{item.author}</span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8f6a11]">{item.relation_reason}</p>
                  <h3 className="mt-2 text-lg font-semibold leading-tight text-[#1f1a12]">{item.title}</h3>
                </div>

                <p className="text-sm leading-relaxed text-[#4b3f2d]">{excerpt(item.description, 132) || "Abrir ensenanza relacionada."}</p>

                <div className="flex items-center justify-between border-t border-[#eadfc8] pt-3 text-xs text-[#6d5a3f]">
                  <span>{formatDateLabel(item.published_at)}</span>
                  <span className="font-semibold text-[#8f6a11]">Abrir</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
