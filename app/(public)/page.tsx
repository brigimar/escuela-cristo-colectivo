import Link from "next/link";
import HeroLive from "@/features/home/components/HeroLive";
import { Donations as Donaciones } from "@/features/home/components/Donaciones";
import { Channels as Canales } from "@/features/home/components/Canales";
import { VideoRecomendado } from "@/features/home/components/VideoRecomendado";
import { PreguntasAudiencia } from "@/features/home/components/PreguntasAudiencia";
import { RecentTeachings } from "@/features/home/components/RecentTeachings";
import { Icon, PrimaryButton, SecondaryButton, SectionHeader, Surface } from "@/features/home/components/ui";
import * as videoQueries from "@/features/videos/queries";
type AnyVideo = Record<string, any>;

function toText(v: unknown) {
  return typeof v === "string" ? v : "";
}

function normalizeVideo(v: AnyVideo) {
  const slug = toText(v.slug) || toText(v.id);
  const title = toText(v.title) || "Enseñanza";
  const published_at = toText(v.published_at) || toText(v.created_at) || "";
  const thumbnail_url = toText(v.thumbnail_url) || "";
  const category_name = toText(v.category_name) || null;
  const category_slug = toText(v.category_slug) || null;
  const youtube_video_id = toText(v.youtube_video_id) || null;

  return {
    youtube_video_id,
    slug,
    title,
    published_at,
    thumbnail_url,
    category_name,
    category_slug,
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


export default async function Page() {
  const latest = await getLatestVideos(8);
  const state = await videoQueries.getSiteState().catch(() => null);
  const latestVideo = await videoQueries.getLatestVideo().catch(() => null);
  const activeLatestVideoId = state?.is_live ? latestVideo?.youtube_video_id ?? null : null;
  const latestWithBadges = latest.map((v) => ({
    ...v,
    is_live: Boolean(activeLatestVideoId && v.youtube_video_id === activeLatestVideoId),
  }));
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
              <a className="hover:text-black rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60" href="/#donaciones">
                Donaciones
              </a>
              <a className="hover:text-black rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/60" href="/#canales">
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
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <HeroLive isLive={Boolean(state?.is_live)} latestVideo={latestVideo ?? undefined} />
          </div>
        </section>

        {/* Enseñanzas */}
        <section id="ensenanzas" className="border-t border-black/10">
          {latestWithBadges.length ? (
            <RecentTeachings
              videos={latestWithBadges}
              title="Enseñanzas recientes"
              subtitle="Las últimas 8 enseñanzas disponibles en el sitio."
              ctaHref="/videos"
              ctaLabel="Ver todas las enseñanzas"
              limit={8}
            />
          ) : (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
              <SectionHeader
                eyebrow="Lo más reciente"
                title="Enseñanzas recientes"
                desc="Las últimas 4 enseñanzas disponibles en el sitio."
              />
              <div className="mt-10">
                <Surface className="p-7 text-center">
                  <p className="text-black/70">No hay videos para mostrar aquí (o la query devolvió vacío).</p>
                </Surface>
              </div>
            </div>
          )}
        </section>

        <section id="recomendado" className="border-t border-black/10">
          <VideoRecomendado />
        </section>

        {/* FAQ */}
        <section id="preguntas" className="border-t border-black/10">
          <PreguntasAudiencia />
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
          <Donaciones />
        </section>

        {/* Canales */}
        <section id="canales" className="border-t border-black/10">
          <Canales />
        </section>

        {/* Manifiesto */}
        <section id="manifiesto" className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeader eyebrow="Propósito" title="Manifiesto" desc="Una intención simple: claridad, verdad y transformación." />

            <Surface className="mt-10 mx-auto max-w-3xl p-8">
              <p className="text-black/80 text-lg leading-relaxed">
                Creemos que la meta no es el conocimiento por sí mismo, sino la vida de Cristo manifestándose en cada creyente, hasta que podamos decir con el apóstol Pablo: “Ya no vivo yo, mas vive Cristo en mí.”
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
