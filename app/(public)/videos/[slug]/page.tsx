import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { RelatedTeachings } from "@/features/videos/components/RelatedTeachings"
import { getPublishedVideoDetailPresentationBySlug, listRelatedPublishedVideosBySlug } from "@/features/videos/queries"
import { excerpt } from "@/lib/text/excerpt"
import { getSiteUrl } from "@/lib/site/url"

type Props = { params: { slug: string } }

export const revalidate = 3600

function formatDateLabel(value: string | null): string {
  if (!value) return "Sin fecha"
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
  }).format(new Date(value))
}

function buildDescriptionParagraphs(text: string): string[] {
  const normalized = text.replace(/\r/g, "").trim()
  if (!normalized) return []
  return normalized
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n+/g, " ").replace(/\s+/g, " ").trim())
    .filter((block) => block.length > 0)
}

function renderTextWithLinks(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
    if (!/^https?:\/\//i.test(part)) return <span key={`t-${index}`}>{part}</span>
    return (
      <a
        key={`l-${index}`}
        href={part}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-[#8f6a11] underline decoration-[#b8921f] underline-offset-2 transition-colors hover:text-[#6c4f0d]"
      >
        {part}
      </a>
    )
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await getPublishedVideoDetailPresentationBySlug(params.slug)
  if (!video) return { title: "Videos | Escuela de Cristo" }

  const description = excerpt(video.description ?? "", 160)
  const title = `${video.title} | Escuela de Cristo`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: video.thumbnail_url ? [video.thumbnail_url] : undefined
    }
  }
}

export default async function VideoDetail({ params }: Props) {
  const [video, relatedTeachings] = await Promise.all([
    getPublishedVideoDetailPresentationBySlug(params.slug),
    listRelatedPublishedVideosBySlug(params.slug, 3),
  ])
  if (!video) return notFound()

  const dateLabel = formatDateLabel(video.published_at)
  const subtitle = excerpt(video.description, 220) || "Enseñanza disponible para estudio y meditación."
  const paragraphs = buildDescriptionParagraphs(video.description)
  const curatedParagraphs = paragraphs.slice(0, 8)
  const hasMoreDescription = paragraphs.length > curatedParagraphs.length
  const shareUrl = `${getSiteUrl()}${video.url}`
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(`${video.title} ${shareUrl}`)}`

  return (
    <main className="min-h-screen bg-[#f7f1e4]">
      <section className="border-b border-[#dbcaa8] bg-[radial-gradient(130%_100%_at_50%_0%,#efe2c4_0%,#f7f1e4_68%,#f7f1e4_100%)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6a11]">Escuela de Cristo</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-[#1f1a12] sm:text-4xl lg:text-5xl">{video.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#4f412d] sm:text-lg">{subtitle}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-[#5f4c33]">
            <span className="inline-flex items-center rounded-full border border-[#d8c4a0] bg-[#f7f0e1] px-3 py-1 font-medium">{video.category}</span>
            <span className="inline-flex items-center rounded-full border border-[#d6cfbe] bg-[#f7f3ea] px-3 py-1 font-medium">{video.author}</span>
            <span className="inline-flex items-center rounded-full border border-[#d6cfbe] bg-[#f7f3ea] px-3 py-1 font-medium">{dateLabel}</span>
            {video.series ? (
              <span className="inline-flex items-center rounded-full border border-[#d8c4a0] bg-[#f4e7d2] px-3 py-1 font-medium">{video.series}</span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <article className="overflow-hidden rounded-3xl border border-[#dccbac] bg-[#fffdf9] shadow-[0_10px_28px_rgba(62,44,16,0.10)]">
              <div className="border-b border-[#e6d8bd] bg-[#f4e7d2] px-5 py-4 sm:px-6">
                <h2 className="text-base font-semibold text-[#2f2417] sm:text-lg">Video principal</h2>
              </div>
              <div className="p-3 sm:p-4 lg:p-5">
                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[#d8c4a0] bg-black shadow-[0_14px_30px_rgba(0,0,0,0.16)]">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.video_id}`}
                    title={video.title}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </article>

            <article className="mt-6 rounded-3xl border border-[#dccbac] bg-[#fffdf9] p-5 shadow-[0_10px_28px_rgba(62,44,16,0.10)] sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight text-[#1f1a12]">Descripción</h2>
              {curatedParagraphs.length > 0 ? (
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#3f3220] sm:text-base">
                  {curatedParagraphs.map((paragraph, index) => (
                    <p key={`${index}-${paragraph.slice(0, 30)}`} className="break-words">
                      {renderTextWithLinks(paragraph)}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#6e5a3f]">Esta enseñanza no incluye descripción extendida.</p>
              )}

              {hasMoreDescription ? (
                <div className="mt-6 rounded-2xl border border-[#e5d4b4] bg-[#f9f2e3] p-4 text-sm text-[#5b4a32]">
                  La descripción completa continúa en YouTube.
                </div>
              ) : null}
            </article>

            <RelatedTeachings items={relatedTeachings} />
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-6">
              <section className="rounded-3xl border border-[#dccbac] bg-[#fffdf9] p-5 shadow-[0_10px_28px_rgba(62,44,16,0.10)]">
                <h2 className="text-lg font-semibold text-[#1f1a12]">Datos de la enseñanza</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="rounded-xl border border-[#e6d8bd] bg-[#fdf8ee] px-3 py-2.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a6543]">Autor</dt>
                    <dd className="mt-1 text-[#2f2417]">{video.author}</dd>
                  </div>
                  <div className="rounded-xl border border-[#e6d8bd] bg-[#fdf8ee] px-3 py-2.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a6543]">Categoría</dt>
                    <dd className="mt-1 text-[#2f2417]">{video.category}</dd>
                  </div>
                  <div className="rounded-xl border border-[#e6d8bd] bg-[#fdf8ee] px-3 py-2.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a6543]">Fecha</dt>
                    <dd className="mt-1 text-[#2f2417]">{dateLabel}</dd>
                  </div>
                  {video.series ? (
                    <div className="rounded-xl border border-[#e6d8bd] bg-[#fdf8ee] px-3 py-2.5">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a6543]">Serie</dt>
                      <dd className="mt-1 text-[#2f2417]">{video.series}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-5 space-y-2">
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2f2314] px-4 text-sm font-medium text-[#f8efdc] transition-colors hover:bg-[#22180e]"
                  >
                    Ver en YouTube
                  </a>
                  <a
                    href={whatsappShareHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#cdb58d] bg-[#fff4df] px-4 text-sm font-medium text-[#3a2b19] transition-colors hover:bg-[#f6e8cc]"
                  >
                    Compartir enseñanza
                  </a>
                </div>
              </section>

              <section className="rounded-3xl border border-[#dccbac] bg-[#fffdf9] p-5 shadow-[0_10px_28px_rgba(62,44,16,0.10)]">
                <h2 className="text-lg font-semibold text-[#1f1a12]">Recursos relacionados</h2>
                <div className="mt-4 space-y-2">
                  <a href="/videos" className="block rounded-xl border border-[#e6d8bd] bg-[#fdf8ee] px-3 py-2.5 text-sm text-[#2f2417] transition-colors hover:bg-[#f8eedc]">
                    Volver a enseñanzas
                  </a>
                  <a
                    href="/respuestas-a-preguntas"
                    className="block rounded-xl border border-[#e6d8bd] bg-[#fdf8ee] px-3 py-2.5 text-sm text-[#2f2417] transition-colors hover:bg-[#f8eedc]"
                  >
                    Ver respuestas a preguntas
                  </a>
                  <a href="/biblioteca" className="block rounded-xl border border-[#e6d8bd] bg-[#fdf8ee] px-3 py-2.5 text-sm text-[#2f2417] transition-colors hover:bg-[#f8eedc]">
                    Explorar biblioteca
                  </a>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
