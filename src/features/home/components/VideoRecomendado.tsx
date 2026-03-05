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
          <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500">Destacado</p>
          <h2 id="video-recomendado-title" className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Video recomendado
          </h2>
        </div>

        {!recommended ? (
          <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-neutral-600">Todavía no hay un video recomendado.</p>
            <div className="mt-6">
              <Link
                href="/videos"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              >
                Ver enseñanzas
              </Link>
            </div>
          </div>
        ) : (
          <article className="mt-12 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
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
                <div className="absolute inset-0 bg-neutral-100" />
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900">
                {recommended.title || "Video recomendado"}
              </h3>
              {recommended.published_at ? (
                <p className="mt-2 text-sm text-neutral-500">{formatDate(recommended.published_at)}</p>
              ) : null}
              <div className="mt-5">
                <Link
                  href={recommended.slug ? `/videos/${recommended.slug}` : "/videos"}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
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

