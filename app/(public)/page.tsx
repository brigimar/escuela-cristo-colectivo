import Link from "next/link";
import * as videoQueries from "../../src/features/videos/queries";

type AnyVideo = Record<string, any>;

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function toText(v: unknown) {
  return typeof v === "string" ? v : "";
}

function toDateLabel(value: unknown) {
  const raw = typeof value === "string" ? value : "";
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "2-digit" });
}

function normalizeVideo(v: AnyVideo) {
  const slug = toText(v.slug) || toText(v.id);
  const title = toText(v.title) || "Enseñanza";
  const publishedAt = toText(v.published_at) || toText(v.created_at) || "";
  const thumbnail = toText(v.thumbnail_url) || "";
  return {
    slug,
    title,
    publishedAt,
    publishedLabel: toDateLabel(publishedAt),
    thumbnail,
  };
}

async function getLatestVideos(limit = 4) {
  const listAll = (videoQueries as any).listVideos as undefined | (() => Promise<any>);
  if (typeof listAll !== "function") return [];

  try {
    const res = await listAll();
    const rows: AnyVideo[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

    // Importante: si listVideos() devuelve ascendente, esto lo corrige.
    const sorted = [...rows].sort((a, b) => {
      const da = new Date(toText(a.published_at) || toText(a.created_at) || 0).getTime();
      const db = new Date(toText(b.published_at) || toText(b.created_at) || 0).getTime();
      return db - da;
    });

    return sorted
      .slice(0, limit)
      .map(normalizeVideo)
      .filter((x: ReturnType<typeof normalizeVideo>) => x.slug);
  } catch {
    return [];
  }
}

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("material-symbols-rounded align-middle leading-none", className)} aria-hidden="true">
      {name}
    </span>
  );
}

function PrimaryButton({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3",
        "bg-primary text-black font-medium shadow-sm",
        "hover:brightness-95 active:brightness-90",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60"
      )}
    >
      {icon ? <Icon name={icon} className="text-[20px]" /> : null}
      <span>{children}</span>
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3",
        "bg-white/60 backdrop-blur-sm text-black ring-1 ring-black/10",
        "hover:bg-white/80 active:bg-white/70",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60"
      )}
    >
      {icon ? <Icon name={icon} className="text-[20px]" /> : null}
      <span>{children}</span>
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="text-sm font-medium tracking-wide text-black/60">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-black">{title}</h2>
      {desc ? <p className="mt-3 text-base md:text-lg text-black/70">{desc}</p> : null}
    </div>
  );
}

function Surface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white/60 backdrop-blur-sm ring-1 ring-black/10",
        "shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export default async function Page() {
  const latest = await getLatestVideos(4);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background-light font-display antialiased text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-background-light/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/5">
                <Icon name="menu_book" className="text-[20px]" />
              </span>
              <span className="font-semibold tracking-tight">Escuela de Cristo</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm text-black/70">
              <a className="hover:text-black rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60" href="#ensenanzas">
                Enseñanzas
              </a>
              <a className="hover:text-black rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60" href="#preguntas">
                Preguntas
              </a>
              <a className="hover:text-black rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60" href="#biblioteca">
                Biblioteca
              </a>
              <a className="hover:text-black rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60" href="#donaciones">
                Donaciones
              </a>
              <a className="hover:text-black rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60" href="#canales">
                Canales
              </a>
              <a className="hover:text-black rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60" href="#manifiesto">
                Manifiesto
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <SecondaryButton href="#canales" icon="notifications">
                  Recibir recordatorio
                </SecondaryButton>
              </div>
              <PrimaryButton href="/videos" icon="play_circle">
                Ver enseñanzas
              </PrimaryButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -bottom-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-black/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pt-12 md:pt-16 pb-12 md:pb-16">
            <div className="grid items-start gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-sm text-black/70">
                  <Icon name="verified" className="text-[18px]" />
                  Contenido oficial · Actualizado semanalmente
                </p>

                <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
                  Enseñanzas claras,
                  <span className="block">profundas y prácticas</span>
                  <span className="block text-black/70">para formar criterio espiritual.</span>
                </h1>

                <p className="mt-5 text-base md:text-lg text-black/70 max-w-2xl">
                  Accedé a las enseñanzas del canal <strong>@JoaquinPensa</strong>, organizadas para estudiar, volver a ver y
                  compartir con claridad.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <PrimaryButton href="#ensenanzas" icon="arrow_downward">
                    Ver lo más reciente
                  </PrimaryButton>
                  <SecondaryButton href="/videos" icon="library_books">
                    Ir a la biblioteca
                  </SecondaryButton>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                  {[
                    { k: "Ritmo", v: "Semanal", icon: "schedule" },
                    { k: "Fuente", v: "YouTube oficial", icon: "smart_display" },
                    { k: "Acceso", v: "Gratis", icon: "lock_open" },
                  ].map((x) => (
                    <Surface key={x.k} className="p-4">
                      <div className="flex items-center gap-2 text-black/60">
                        <Icon name={x.icon} className="text-[18px]" />
                        <p className="text-sm">{x.k}</p>
                      </div>
                      <p className="mt-1 font-medium">{x.v}</p>
                    </Surface>
                  ))}
                </div>
              </div>

              <aside className="lg:col-span-5">
                <Surface className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-black/60">Encuentro</p>
                      <h3 className="mt-1 text-xl font-semibold tracking-tight">Vivo semanal</h3>
                      <p className="mt-2 text-black/70">
                        Horario a confirmar. Activá recordatorios por canales oficiales (Telegram/YouTube).
                      </p>
                    </div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/80">
                      <Icon name="live_tv" className="text-[22px]" />
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <PrimaryButton href="/videos" icon="play_arrow">
                      Ver últimos videos
                    </PrimaryButton>
                    <SecondaryButton href="#canales" icon="send">
                      Ver canales
                    </SecondaryButton>
                  </div>

                  <div className="mt-6 rounded-2xl bg-black/5 p-4">
                    <p className="text-sm text-black/60">Transparencia</p>
                    <p className="mt-1 text-sm text-black/70">
                      “Enseñanzas recientes” usa datos reales desde Supabase (sin badges inventados).
                    </p>
                  </div>
                </Surface>
              </aside>
            </div>
          </div>
        </section>

        {/* Enseñanzas */}
        <section id="ensenanzas" className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeader
              eyebrow="Lo más reciente"
              title="Enseñanzas recientes"
              desc="Las últimas 4 enseñanzas disponibles en el sitio."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {latest.length ? (
                latest.map((v) => {
                  const href = `/videos/${encodeURIComponent(v.slug)}`;
                  return (
                    <article key={v.slug} className="group">
                      <Surface className="p-4 transition hover:shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)]">
                        <Link
                          href={href}
                          className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60"
                        >
                          <div className="rounded-2xl bg-black/5 overflow-hidden aspect-video">
                            {v.thumbnail ? (
                              <img
                                src={v.thumbnail}
                                alt={v.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-black/50">
                                <Icon name="ondemand_video" className="text-[28px]" />
                              </div>
                            )}
                          </div>

                          <h3 className="mt-4 line-clamp-2 text-base font-semibold tracking-tight">{v.title}</h3>

                          <div className="mt-2 flex items-center justify-between text-sm text-black/60">
                            <span>{v.publishedLabel || "—"}</span>
                            <span className="inline-flex items-center gap-1 text-black/70">
                              Ver <Icon name="arrow_forward" className="text-[18px]" />
                            </span>
                          </div>
                        </Link>
                      </Surface>
                    </article>
                  );
                })
              ) : (
                <Surface className="md:col-span-2 lg:col-span-4 p-7 text-center">
                  <p className="text-black/70">No hay videos para mostrar aquí (o la query devolvió vacío).</p>
                </Surface>
              )}
            </div>

            <div className="mt-9 flex justify-center">
              <SecondaryButton href="/videos" icon="video_library">
                Ver todas las enseñanzas
              </SecondaryButton>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="preguntas" className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeader eyebrow="FAQ" title="Preguntas frecuentes" desc="Respuestas cortas, directas y útiles." />

            <div className="mt-10 mx-auto max-w-3xl space-y-3">
              {[
                {
                  q: "¿De dónde salen los videos?",
                  a: "Del canal oficial @JoaquinPensa. El sitio sincroniza y muestra contenido real guardado en Supabase.",
                },
                { q: "¿Necesito cuenta para ver?", a: "No. Podés ver y compartir libremente las enseñanzas disponibles." },
                { q: "¿Con qué frecuencia se actualiza?", a: "Semanalmente (cuando el canal publica)." },
                { q: "¿Puedo guardar para estudiar luego?", a: "Sí. Usá /videos para navegar y volver cuando quieras." },
                {
                  q: "¿Cómo recibo avisos de nuevos contenidos?",
                  a: "En Canales/Redes se publicarán las opciones oficiales (YouTube/Telegram).",
                },
              ].map((item) => (
                <details key={item.q} className="group">
                  <Surface className="p-5">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-medium">{item.q}</h3>
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/5">
                          <Icon name="expand_more" className="text-[22px] transition group-open:rotate-180" />
                        </span>
                      </div>
                    </summary>
                    <p className="mt-3 text-black/70">{item.a}</p>
                  </Surface>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Biblioteca */}
        <section id="biblioteca" className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeader
              eyebrow="Estudio"
              title="Biblioteca"
              desc="Organización para leer, escuchar y volver a repasar."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                { icon: "bookmark", title: "Listas y series", desc: "Agrupación por series/temas (próximamente)." },
                { icon: "search", title: "Búsqueda", desc: "Búsqueda rápida por título y palabras clave (próximamente)." },
                { icon: "share", title: "Compartir", desc: "Links directos por enseñanza para grupos y amigos." },
              ].map((x) => (
                <Surface key={x.title} className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/5">
                      <Icon name={x.icon} className="text-[22px]" />
                    </span>
                    <h3 className="text-lg font-semibold">{x.title}</h3>
                  </div>
                  <p className="mt-3 text-black/70">{x.desc}</p>
                </Surface>
              ))}
            </div>

            <div className="mt-9 flex justify-center">
              <SecondaryButton href="/videos" icon="library_books">
                Ir a /videos
              </SecondaryButton>
            </div>
          </div>
        </section>

        {/* Donaciones */}
        <section id="donaciones" className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeader eyebrow="Sostener" title="Donaciones" desc="Si este trabajo te bendice, podés ayudar a sostenerlo." />

            <Surface className="mt-10 mx-auto max-w-3xl p-7">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold">Aporte voluntario</h3>
                  <p className="mt-2 text-black/70">
                    Agregá aquí el método oficial cuando esté listo (MercadoPago / Transferencia / etc).
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <PrimaryButton href="#canales" icon="favorite">
                    Ver opciones
                  </PrimaryButton>
                  <SecondaryButton href="/videos" icon="play_circle">
                    Seguir viendo
                  </SecondaryButton>
                </div>
              </div>
              <p className="mt-6 text-sm text-black/60">Este bloque es deliberadamente sobrio (sin presión).</p>
            </Surface>
          </div>
        </section>

        {/* Canales */}
        <section id="canales" className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeader
              eyebrow="Conectar"
              title="Canales y redes"
              desc="Suscribite y recibí actualizaciones por los canales oficiales."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Surface className="p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/70">
                    <Icon name="smart_display" className="text-[22px]" />
                  </span>
                  <h3 className="text-lg font-semibold">YouTube</h3>
                </div>
                <p className="mt-3 text-black/70">Canal oficial: @JoaquinPensa</p>
                <div className="mt-5">
                  <SecondaryButton href="/videos" icon="open_in_new">
                    Ver en el sitio
                  </SecondaryButton>
                </div>
              </Surface>

              <Surface className="p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/5">
                    <Icon name="send" className="text-[22px]" />
                  </span>
                  <h3 className="text-lg font-semibold">Telegram</h3>
                </div>
                <p className="mt-3 text-black/70">Placeholder: agregá aquí el link del bot/canal cuando esté listo.</p>
              </Surface>

              <Surface className="p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/5">
                    <Icon name="mail" className="text-[22px]" />
                  </span>
                  <h3 className="text-lg font-semibold">Email</h3>
                </div>
                <p className="mt-3 text-black/70">Placeholder: newsletter simple para recordatorios (si se habilita).</p>
              </Surface>
            </div>
          </div>
        </section>

        {/* Manifiesto */}
        <section id="manifiesto" className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeader eyebrow="Propósito" title="Manifiesto" desc="Una intención simple: claridad, verdad y transformación." />

            <Surface className="mt-10 mx-auto max-w-3xl p-8">
              <p className="text-black/80 text-lg leading-relaxed">
                Buscamos formar un criterio espiritual sobrio: entender, obedecer y perseverar. Que la enseñanza no sea ruido,
                sino dirección. Que el contenido sea un puente hacia una vida ordenada.
              </p>
              <p className="mt-4 text-black/70">Empezá por una enseñanza reciente y volvé cada semana.</p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <PrimaryButton href="#ensenanzas" icon="arrow_upward">
                  Ir a enseñanzas
                </PrimaryButton>
                <SecondaryButton href="/videos" icon="video_library">
                  Abrir biblioteca
                </SecondaryButton>
              </div>
            </Surface>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="font-semibold">Escuela de Cristo</p>
                <p className="mt-1 text-sm text-black/60">Contenido del canal oficial · Sitio para lectura y estudio</p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-black/70">
                <a className="hover:text-black" href="#ensenanzas">Enseñanzas</a>
                <a className="hover:text-black" href="#preguntas">Preguntas</a>
                <a className="hover:text-black" href="#biblioteca">Biblioteca</a>
                <a className="hover:text-black" href="#donaciones">Donaciones</a>
                <a className="hover:text-black" href="#canales">Canales</a>
                <a className="hover:text-black" href="#manifiesto">Manifiesto</a>
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-black/60">
              <p>© {year} Escuela de Cristo. Todos los derechos reservados.</p>
              <p className="inline-flex items-center gap-2">
                <Icon name="security" className="text-[18px]" />
                Videos reales desde Supabase
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}