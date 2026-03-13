import Link from "next/link"
import Image from "next/image"
import {
  PRIMARY_BUTTON_CLASS,
  PREMIUM_CARD_BASE_CLASS,
  PREMIUM_CARD_INTERACTIVE_CLASS,
  premiumChipClass,
} from "@/features/home/components/ui"

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
      className="bg-[#f8f1e4] py-14 sm:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8e6e2f]">
            Lo más reciente
          </div>

          <h2
            id="recent-teachings"
            className="mt-3 text-3xl font-semibold tracking-tight text-[#1f1b16] sm:text-4xl"
          >
            {title}
          </h2>

          <p className="mt-3 text-base text-[#5a4c34] sm:text-lg">
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
                    `relative flex h-full flex-col overflow-hidden rounded-lg ${PREMIUM_CARD_BASE_CLASS} ${PREMIUM_CARD_INTERACTIVE_CLASS}`,
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a95a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f1e4]"
                  ].join(" ")}
                >
                  <div className="p-3">
                    <div className="relative overflow-hidden rounded-md bg-[#f1e5cf]">
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

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120f0c]/30 via-transparent to-transparent" />

                      <div className={`absolute left-3 top-3 inline-flex items-center gap-2 shadow-sm ${premiumChipClass("warm")}`}>
                        <IconPlay className="h-4 w-4" />
                        Ver
                      </div>

                      <div className="absolute right-3 top-3 flex max-w-[72%] flex-wrap justify-end gap-1.5">
                        {showLiveBadge ? (
                          <span className="inline-flex items-center rounded-sm bg-[#b5261a] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Live
                          </span>
                        ) : null}

                        {showNewBadge ? (
                          <span className="inline-flex items-center rounded-sm bg-[#687c48] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Nuevo
                          </span>
                        ) : null}

                        {v.category_name ? (
                          <span className={premiumChipClass("ink")}>
                            {v.category_name}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between overflow-hidden px-4 pb-4 pt-2">
                    <h3 className="min-w-0 text-sm font-semibold leading-5 text-[#1f1a12] line-clamp-2 break-words">
                      {v.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 truncate text-xs text-[#6d5a3f]">
                        {dateLabel ? dateLabel : "—"}
                      </div>

                      <div className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#6d5318]">
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
              PRIMARY_BUTTON_CLASS,
              "focus-visible:ring-offset-[#f8f1e4]"
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