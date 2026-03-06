import { listSelectedAudienceQuestions } from "@/features/questions/queries"
import { listRespuestasAudio } from "@/features/audio/queries"

function formatDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "2-digit" })
}

export default async function RespuestasAPreguntasPage() {
  const questions = await listSelectedAudienceQuestions(12)
  const audios = await listRespuestasAudio(50)

  return (
    <main className="min-h-screen bg-background-light font-display antialiased text-black">
      <section className="border-b border-black/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500">EN VIVO</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Respuestas a preguntas
          </h1>
          <p className="mt-3 text-base text-neutral-600 sm:text-lg">
            Preguntas seleccionadas y respuestas en audio publicadas por el owner.
          </p>
        </div>
      </section>

      <section className="border-b border-black/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Preguntas seleccionadas</h2>
          {questions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              Todavía no hay preguntas seleccionadas.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {questions.map((q) => (
                <article key={q.id} className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <p className="line-clamp-3 break-words text-sm leading-relaxed text-neutral-800">
                    {q.text_display || "Pregunta sin texto disponible."}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                    {q.author_name ? <span>{q.author_name}</span> : null}
                    {typeof q.like_count === "number" ? <span>{q.like_count} likes</span> : null}
                    <span>{formatDate(q.selected_at ?? q.published_at) || "—"}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Audios</h2>
          {audios.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              Todavía no hay audios publicados.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {audios.map((a) => (
                <article key={a.id} className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <h3 className="text-base font-semibold text-neutral-900 break-words">{a.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                    <span>{formatDate(a.created_at) || "—"}</span>
                    {a.created_by ? <span>{a.created_by}</span> : null}
                  </div>
                  {a.public_url ? (
                    <div className="mt-4">
                      <audio controls src={a.public_url} className="w-full">
                        Tu navegador no soporta audio.
                      </audio>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-neutral-500">Audio no disponible.</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
