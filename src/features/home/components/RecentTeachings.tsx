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
    <section
      aria-labelledby="recent-teachings"
      className="bg-[#17130f] py-14 sm:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c9a95a]">
            Lo más reciente
          </div>

          <h2
            id="recent-teachings"
            className="mt-3 text-3xl font-semibold tracking-tight text-[#f7f1e8] sm:text-4xl"
          >
            {title}
          </h2>

          <p className="mt-3 text-base text-[#c9bca8] sm:text-lg">
            {subtitle}
          </p>
        </div>

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
                    <rect width="100%" height="100%" fill="#2a241d"/>
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#b7ab96" font-family="Arial" font-size="36">
                      Sin miniatura
                    </text>
                  </svg>`
                )

            return (
              <article key={v.slug} className="group">
                <Link
                  href={`/videos/${v.slug}`}
                  className={[
                    "relative flex h-full flex-col overflow-hidden rounded-xl border border-[#3a3025] bg-[#211b15]",
                    "shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
                    "transition-all duration-300 ease-out",
                    "hover:-translate-y-1 hover:border-[#6e5831] hover:shadow-[0_20px_44px_rgba(0,0,0,0.34)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a95a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17130f]"
                  ].join(" ")}
                >
                  <div className="p-3">
                    <div className="relative overflow-hidden rounded-lg bg-[#2a221a]">
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

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120f0c]/60 via-transparent to-transparent" />

                      <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-md bg-[#f4ead6]/92 px-2.5 py-1.5 text-xs font-medium text-[#241b12] shadow-sm ring-1 ring-[#ccb07a]/40">
                        <IconPlay className="h-4 w-4" />
                        Ver
                      </div>

                      <div className="absolute right-3 top-3 flex max-w-[72%] flex-wrap justify-end gap-1.5">
                        {showLiveBadge ? (
                          <span className="inline-flex items-center rounded-md bg-[#b5261a] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Live
                          </span>
                        ) : null}

                        {showNewBadge ? (
                          <span className="inline-flex items-center rounded-md bg-[#55663a] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Nuevo
                          </span>
                        ) : null}

                        {v.category_name ? (
                          <span className="inline-flex items-center rounded-md bg-[#efe2c8]/92 px-2 py-1 text-[10px] font-medium text-[#4a3b26] ring-1 ring-[#ccb07a]/35">
                            {v.category_name}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between overflow-hidden px-4 pb-4 pt-2">
                    <h3 className="min-w-0 text-sm font-semibold leading-5 text-[#f5efe6] line-clamp-2 break-words">
                      {v.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 truncate text-xs text-[#a99a84]">
                        {dateLabel ? dateLabel : "—"}
                      </div>

                      <div className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#dcc184]">
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

        <div className="mt-10 flex justify-center">
          <Link
            href={ctaHref}
            className={[
              "inline-flex items-center gap-2 rounded-lg border border-[#b99443] bg-[linear-gradient(180deg,#e2c267_0%,#cfa748_100%)] px-5 py-3",
              "text-sm font-semibold text-[#22180e] shadow-[0_12px_28px_rgba(0,0,0,0.25)]",
              "transition-all duration-300 hover:-translate-y-0.5 hover:brightness-[1.04] hover:shadow-[0_16px_36px_rgba(0,0,0,0.32)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d2b56b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17130f]"
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