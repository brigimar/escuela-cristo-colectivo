import Link from "next/link"
import { getVideoRecommendation } from "@/features/recommendation/queries"

function formatDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "2-digit" })
}

export async function VideoRecomendado() {
  const recommended = await getVideoRecommendation()

  return (
    <section aria-labelledby="video-recomendado-title" className="py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#8e6e2f]">Destacado</p>
          <h2 id="video-recomendado-title" className="mt-3 text-3xl font-semibold tracking-tight text-[#201a12] sm:text-4xl">
            Video recomendado
          </h2>
        </div>

        {!recommended ? (
          <div className="mt-12 rounded-2xl border border-[#d9c7a2] bg-[#fffdf6] p-8 text-center shadow-[0_12px_34px_rgba(70,50,18,0.12)]">
            <p className="text-sm text-[#5f5036]">Todavía no hay un video recomendado.</p>
            <div className="mt-6">
              <Link
                href="/videos"
                className="inline-flex items-center justify-center rounded-xl border border-[#d3bd92] bg-[#fff6e5] px-4 py-2 text-sm font-semibold text-[#2b2113] transition-colors hover:bg-[#f8ebcf] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              >
                Ver enseñanzas
              </Link>
            </div>
          </div>
        ) : (
          <article className="mt-12 overflow-hidden rounded-2xl border border-[#d5c19b] bg-[#fffdf6] shadow-[0_16px_44px_rgba(70,50,18,0.16)]">
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              {recommended.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={recommended.thumbnail_url}
                  alt={recommended.title || "Video recomendado"}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-[#efe3cc]" />
              )}
            </div>
            <div className="p-6 bg-[linear-gradient(180deg,#fffdf6_0%,#fbf1dd_100%)]">
              <h3 className="text-lg font-semibold text-[#1f1a12]">
                {recommended.title || "Video recomendado"}
              </h3>
              {recommended.published_at ? (
                <p className="mt-2 text-sm text-[#78684a]">{formatDate(recommended.published_at)}</p>
              ) : null}
              <div className="mt-5">
                <Link
                  href={recommended.slug ? `/videos/${recommended.slug}` : "/videos"}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d3bd92] bg-[#fff6e5] px-4 py-2 text-sm font-semibold text-[#2b2113] transition-colors hover:bg-[#f8ebcf] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                >
                  Ver enseñanza
                </Link>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  )
}


