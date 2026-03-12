import Link from "next/link"
import { listSelectedAudienceQuestions, mapVideoSlugsByYoutubeId } from "@/features/questions/queries"
import {
  PRIMARY_BUTTON_CLASS,
  PREMIUM_CARD_BASE_CLASS,
  PREMIUM_CARD_INTERACTIVE_CLASS,
  premiumChipClass,
  SECONDARY_BUTTON_CLASS,
} from "@/features/home/components/ui"

function formatDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "2-digit" })
}

export async function PreguntasAudiencia() {
  const questions = await listSelectedAudienceQuestions(6)
  const ids = questions.map((q) => q.youtube_video_id).filter(Boolean) as string[]
  const slugById = await mapVideoSlugsByYoutubeId(ids)

  return (
    <section aria-labelledby="preguntas-audiencia-title" className="py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500">EN VIVO</p>
          <h2 id="preguntas-audiencia-title" className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Preguntas de la Audiencia
          </h2>
          <p className="mt-3 text-base text-neutral-600 sm:text-lg">
            Preguntas seleccionadas por el owner desde los comentarios del vivo.
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-[#dbc9a7] bg-[#fffdf8] p-8 text-center shadow-[0_14px_36px_rgba(51,39,16,0.08)]">
            <p className="text-sm font-semibold text-neutral-900">Próximamente</p>
            <p className="mt-2 text-sm text-neutral-600">Todavía no hay preguntas publicadas.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {questions.map((q) => {
              const dateLabel = formatDate(q.selected_at ?? q.published_at)
              const slug = q.youtube_video_id ? slugById[q.youtube_video_id] : undefined
              const teachingHref = slug ? `/videos/${slug}` : "/videos"
              const teachingLabel = slug ? "Ver enseñanza" : "Ver enseñanzas"
              const commentHref =
                q.youtube_video_id && q.comment_id
                  ? `https://www.youtube.com/watch?v=${q.youtube_video_id}&lc=${q.comment_id}`
                  : null
              return (
                <article
                  key={q.id}
                  className={`group flex h-full flex-col p-6 ${PREMIUM_CARD_BASE_CLASS} ${PREMIUM_CARD_INTERACTIVE_CLASS}`}
                >
                  <p className="line-clamp-4 text-[15px] leading-7 text-[#241d12] md:text-base">
                    {q.text_display || "Pregunta sin texto disponible."}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                    {q.author_name ? (
                      <span className={premiumChipClass("warm")}>
                        {q.author_name}
                      </span>
                    ) : null}
                    {typeof q.like_count === "number" ? (
                      <span className={premiumChipClass("neutral")}>
                        {q.like_count} likes
                      </span>
                    ) : null}
                    {dateLabel ? (
                      <span className={premiumChipClass("ink")}>
                        {dateLabel}
                      </span>
                    ) : null}
                    <span className={premiumChipClass("warm")}>
                      Publicada
                    </span>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <Link
                      href={teachingHref}
                      className={`${PRIMARY_BUTTON_CLASS} h-10 px-4 py-0 text-xs sm:h-10 sm:px-4 sm:text-xs`}
                    >
                      {teachingLabel}
                    </Link>
                    {commentHref ? (
                      <a
                        href={commentHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${SECONDARY_BUTTON_CLASS} h-10 px-4 py-0 text-xs sm:h-10 sm:px-4 sm:text-xs`}
                      >
                        Ver comentario
                      </a>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/respuestas-a-preguntas"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Ver todas las preguntas
          </Link>
        </div>
      </div>
    </section>
  )
}
