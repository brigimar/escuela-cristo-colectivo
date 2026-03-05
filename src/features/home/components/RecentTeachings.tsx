import Link from "next/link"
import Image from "next/image"

export type RecentVideo = {
  youtube_video_id?: string | null
  slug: string
  title: string
  thumbnail_url?: string | null
  published_at?: string | null
  is_live?: boolean
  category_slug?: string | null
  category_name?: string | null
}

function isNew(publishedAt?: string | null, days = 7) {
  if (!publishedAt) return false
  const publishedTime = new Date(publishedAt).getTime()
  if (Number.isNaN(publishedTime)) return false
  const ageMs = Date.now() - publishedTime
  return ageMs >= 0 && ageMs <= days * 24 * 60 * 60 * 1000
}

function formatDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "2-digit" })
}

function IconPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 8.5v7l6-3.5-6-3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function IconArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 12h12m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RecentTeachings({
  videos,
  title = "Enseñanzas recientes",
  subtitle = "Las últimas enseñanzas disponibles en el sitio.",
  ctaHref = "/videos",
  ctaLabel = "Ver todas las enseñanzas",
  limit = 4
}: {
  videos: RecentVideo[]
  title?: string
  subtitle?: string
  ctaHref?: string
  ctaLabel?: string
  limit?: number
}) {
  const items = (videos ?? []).slice(0, limit)

  if (items.length === 0) return null

  return (
    <section aria-labelledby="recent-teachings" className="py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
            Lo más reciente
          </div>
          <h2
            id="recent-teachings"
            className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 text-base text-neutral-600 sm:text-lg">{subtitle}</p>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((v) => {
            const dateLabel = formatDate(v.published_at)
            const showLiveBadge = Boolean(v.is_live)
            const showNewBadge = !showLiveBadge && isNew(v.published_at, 7)
            const thumb =
              v.thumbnail_url ||
              "data:image/svg+xml;charset=utf-8," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
                    <rect width="100%" height="100%" fill="#eee"/>
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="Arial" font-size="36">
                      Sin miniatura
                    </text>
                  </svg>`
                )

            return (
              <article key={v.slug} className="group">
                <Link
                  href={`/videos/${v.slug}`}
                  className={[
                    "relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white",
                    "shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
                    "transition-all duration-300 ease-out",
                    "hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                  ].join(" ")}
                >
                  {/* Thumbnail */}
                  <div className="p-3">
                    <div className="relative overflow-hidden rounded-xl bg-neutral-200">
                      <div className="relative aspect-video w-full">
                        <Image
                          src={thumb}
                          alt={v.title}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                          priority={false}
                        />
                      </div>

                      {/* Overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-100" />

                      {/* Play chip */}
                      <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-sm">
                        <IconPlay className="h-4 w-4" />
                        Ver
                      </div>

                      {/* Status badges */}
                      <div className="absolute right-3 top-3 flex max-w-[70%] flex-wrap justify-end gap-1.5">
                        {showLiveBadge ? (
                          <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Live
                          </span>
                        ) : null}
                        {showNewBadge ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Nuevo
                          </span>
                        ) : null}
                        {v.category_name ? (
                          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-neutral-800 ring-1 ring-black/10">
                            {v.category_name}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 pb-4 pt-2 overflow-hidden flex-1 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold leading-5 text-neutral-900 line-clamp-2 break-words min-h-[2.6rem]">
                      {v.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 text-xs text-neutral-500 truncate">
                        {dateLabel ? dateLabel : "—"}
                      </div>

                      <div className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-neutral-800">
                        Ver
                        <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href={ctaHref}
            className={[
              "inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3",
              "text-sm font-medium text-neutral-900 ring-1 ring-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
              "transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            ].join(" ")}
          >
            <IconPlay className="h-5 w-5" />
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
