import Link from "next/link"
import { listSelectedAudienceQuestions, mapVideoSlugsByYoutubeId } from "@/features/questions/queries"

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
          <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-semibold text-neutral-900">Próximamente</p>
            <p className="mt-2 text-sm text-neutral-600">Todavía no hay preguntas publicadas.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                >
                  <p className="line-clamp-3 text-sm leading-relaxed text-neutral-800">
                    {q.text_display || "Pregunta sin texto disponible."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                    {q.author_name ? <span>{q.author_name}</span> : null}
                    {typeof q.like_count === "number" ? <span>{q.like_count} likes</span> : null}
                    {dateLabel ? <span>{dateLabel}</span> : null}
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <Link
                      href={teachingHref}
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                    >
                      {teachingLabel}
                    </Link>
                    {commentHref ? (
                      <a
                        href={commentHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded"
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
