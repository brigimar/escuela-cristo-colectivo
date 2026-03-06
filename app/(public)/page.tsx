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

  return (
    <>
      {/* Hero */}
      <main>
        <section className="relative overflow-hidden bg-[radial-gradient(120%_95%_at_50%_0%,#f0e4c8_0%,#f7f1e4_62%,#f7f1e4_100%)]">
          <div className="absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#d6b15c]/30 blur-3xl" />
            <div className="absolute -bottom-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#6a5a3a]/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <HeroLive isLive={Boolean(state?.is_live)} latestVideo={latestVideo ?? undefined} />
          </div>
        </section>

        {/* Enseñanzas */}
        <section id="ensenanzas" className="border-t border-[#dbcaa8] bg-[#fcf8ef]">
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

        <section id="recomendado" className="border-t border-[#dbcaa8] bg-[#f2ead8]">
          <VideoRecomendado />
        </section>

        {/* FAQ */}
        <section id="preguntas" className="border-t border-[#dbcaa8] bg-[#fdfaf3]">
          <PreguntasAudiencia />
        </section>

        {/* Biblioteca */}
        <section id="biblioteca" className="border-t border-[#dbcaa8] bg-[#f4ecdc]">
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
                <Surface key={x.title} className="p-6 bg-[#fffbf3] border-[#d7c49e]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe2c4] text-[#6c5527]">
                      <Icon name={x.icon} className="text-[22px]" />
                    </span>
                    <h3 className="text-lg font-semibold">{x.title}</h3>
                  </div>
                  <p className="mt-3 text-[#5a4d36]">{x.desc}</p>
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
        <section id="donaciones" className="border-t border-[#dbcaa8] bg-[#fbf7ee]">
          <Donaciones />
        </section>

        {/* Canales */}
        <section id="canales" className="border-t border-[#dbcaa8] bg-[#f1e8d7]">
          <Canales />
        </section>

        {/* Manifiesto */}
        <section id="manifiesto" className="border-t border-[#dbcaa8] bg-[#f9f4e9]">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeader eyebrow="Propósito" title="Manifiesto" desc="Una intención simple: claridad, verdad y transformación." />

            <Surface className="mt-10 mx-auto max-w-3xl border-[#cab286] bg-[linear-gradient(165deg,#fffbf1_0%,#f8efd9_100%)] p-8 shadow-[0_18px_46px_rgba(83,61,22,0.14)]">
              <p className="text-[#302612] text-lg leading-relaxed">
                Creemos que la meta no es el conocimiento por sí mismo, sino la vida de Cristo manifestándose en cada creyente, hasta que podamos decir con el apóstol Pablo: “Ya no vivo yo, mas vive Cristo en mí.”
              </p>
              <p className="mt-4 text-[#5f5137]">Empezá por una enseñanza reciente y volvé cada semana.</p>

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

      </main>
    </>
  );
}



