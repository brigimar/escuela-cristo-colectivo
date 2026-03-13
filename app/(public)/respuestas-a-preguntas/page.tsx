import Link from "next/link"
import { listSelectedAudienceQuestions } from "@/features/questions/queries"
import { listRespuestasAudio } from "@/features/audio/queries"

export const revalidate = 60

function formatDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

function IconQuestion(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9.25 9a2.75 2.75 0 1 1 4.62 2c-.8.73-1.87 1.4-1.87 2.5v.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function IconAudio(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 5v14M8 8v8M16 8v8M4.5 10.5v3M19.5 10.5v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconHeart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 20.5s-6.5-4.35-8.5-8.1C1.9 9.2 3.5 6 6.8 6c2 0 3.1 1.1 3.9 2.2C11.5 7.1 12.6 6 14.6 6c3.3 0 4.9 3.2 3.3 6.4-2 3.75-8.5 8.1-8.5 8.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCalendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 3v3M17 3v3M4 9h16M6.5 21h11A2.5 2.5 0 0 0 20 18.5v-11A2.5 2.5 0 0 0 17.5 5h-11A2.5 2.5 0 0 0 4 7.5v11A2.5 2.5 0 0 0 6.5 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "gold" | "ink"
}) {
  const styles =
    tone === "gold"
      ? "border-[#e6cf9a] bg-[#f6ecd4] text-[#7a5b17]"
      : tone === "ink"
        ? "border-[#d9d1c2] bg-[#f5f1e8] text-[#43362a]"
        : "border-black/10 bg-white/80 text-neutral-600"

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${styles}`}
    >
      {children}
    </span>
  )
}

export default async function RespuestasAPreguntasPage() {
  const questions = await listSelectedAudienceQuestions(12)
  const audios = await listRespuestasAudio(50)

  return (
    <main className="min-h-screen bg-[#f7f2e8] font-display text-[#1e1914] antialiased">
      <section className="border-b border-black/10 bg-[linear-gradient(180deg,#fbf7ef_0%,#f4ecdc_100%)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e6d4ab] bg-[#fbf2dc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a20]">
              <IconAudio className="h-4 w-4" />
              Respuestas en audio
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#1f1a15] sm:text-5xl">
              Respuestas a preguntas
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5a4c3a] sm:text-lg">
              Preguntas seleccionadas de la audiencia y respuestas publicadas en audio,
              presentadas en un formato más claro, legible y editorial.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 shadow-[0_12px_32px_rgba(32,22,10,0.06)]">
                <div className="text-xs uppercase tracking-[0.14em] text-[#8a7450]">
                  Preguntas visibles
                </div>
                <div className="mt-1 text-2xl font-semibold text-[#1f1a15]">
                  {questions.length}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/75 px-4 py-3 shadow-[0_12px_32px_rgba(32,22,10,0.06)]">
                <div className="text-xs uppercase tracking-[0.14em] text-[#8a7450]">
                  Audios publicados
                </div>
                <div className="mt-1 text-2xl font-semibold text-[#1f1a15]">
                  {audios.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6e2f]">
                Curación editorial
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a15] sm:text-3xl">
                Preguntas seleccionadas
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5e5141] sm:text-base">
                Una selección de preguntas destacadas que sirven como guía para las respuestas.
              </p>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[#e5dccd] bg-white/90 p-8 text-sm text-[#655849] shadow-[0_18px_50px_rgba(32,22,10,0.08)]">
              Todavía no hay preguntas seleccionadas.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {questions.map((q) => (
                <article
                  key={q.id}
                  className="group relative min-w-0 overflow-hidden rounded-3xl border border-[#eadfc9] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1e4_100%)] p-5 shadow-[0_18px_45px_rgba(60,42,15,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(60,42,15,0.12)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#c89b2d_0%,#e6cb7a_50%,#c89b2d_100%)]" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f3e4bc] text-[#7a5a17] shadow-sm">
                      <IconQuestion className="h-5 w-5" />
                    </div>

                    <Chip tone="gold">
                      <IconCalendar className="h-3.5 w-3.5" />
                      {formatDate(q.selected_at ?? q.published_at) || "—"}
                    </Chip>
                  </div>

                  <p className="mt-5 text-[15px] leading-7 text-[#282019] sm:text-base">
                    {q.text_display || "Pregunta sin texto disponible."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {q.author_name ? (
                      <Chip tone="ink">
                        <IconUser className="h-3.5 w-3.5" />
                        {q.author_name}
                      </Chip>
                    ) : null}

                    {typeof q.like_count === "number" ? (
                      <Chip tone="neutral">
                        <IconHeart className="h-3.5 w-3.5" />
                        {q.like_count} likes
                      </Chip>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8e6e2f]">
                Biblioteca de respuestas
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a15] sm:text-3xl">
                Audios publicados
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5e5141] sm:text-base">
                Respuestas disponibles para escuchar directamente desde la página.
              </p>
            </div>
          </div>

          {audios.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[#e5dccd] bg-white/90 p-8 text-sm text-[#655849] shadow-[0_18px_50px_rgba(32,22,10,0.08)]">
              Todavía no hay audios publicados.
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {audios.map((a) => (
                <article
                  key={a.id}
                  className="overflow-hidden rounded-3xl border border-[#eadfc9] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1e4_100%)] p-5 shadow-[0_18px_45px_rgba(60,42,15,0.08)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7ab] bg-[#fbf1d7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a6718]">
                        <IconAudio className="h-3.5 w-3.5" />
                        Audio
                      </div>

                      <h3 className="mt-3 break-words text-lg font-semibold tracking-tight text-[#1f1a15] sm:text-xl">
                        {a.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Chip tone="gold">
                          <IconCalendar className="h-3.5 w-3.5" />
                          {formatDate(a.created_at) || "—"}
                        </Chip>

                        {a.created_by ? (
                          <Chip tone="ink">
                            <IconUser className="h-3.5 w-3.5" />
                            {a.created_by}
                          </Chip>
                        ) : null}
                      </div>
                    </div>

                    {a.public_url ? (
                      <Link
                        href={a.public_url}
                        target="_blank"
                        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#d9ba68] bg-[linear-gradient(180deg,#e7c455_0%,#d6ad33_100%)] px-4 py-2.5 text-sm font-semibold text-[#241b0d] shadow-[0_10px_24px_rgba(184,138,33,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(184,138,33,0.30)]"
                      >
                        Abrir audio
                      </Link>
                    ) : null}
                  </div>

                  {a.public_url ? (
                    <div className="mt-5 rounded-2xl border border-black/10 bg-white/85 p-3">
                      <audio controls src={a.public_url} className="w-full">
                        Tu navegador no soporta audio.
                      </audio>
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-[#6b5f4f]">Audio no disponible.</p>
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