// src/components/Hero.tsx
import React from "react";
import Link from "next/link";

type LatestVideo = {
  youtube_video_id?: string;
  slug?: string;
  title?: string;
  thumbnail_url?: string | null;
};

type HeroLiveProps = {
  isLive: boolean;
  latestVideo?: LatestVideo | null;
};

function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: "play" | "youtube" | "radio" | "arrowRight" | "verified";
  className?: string;
}) {
  switch (name) {
    case "play":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.5 12 4.5 12 4.5s-5.7 0-7.5.6A3 3 0 0 0 2.4 7.2 31.2 31.2 0 0 0 1.9 12c0 1.6.2 3.2.5 4.8a3 3 0 0 0 2.1 2.1c1.8.6 7.5.6 7.5.6s5.7 0 7.5-.6a3 3 0 0 0 2.1-2.1c.3-1.6.5-3.2.5-4.8s-.2-3.2-.5-4.8z" />
          <path d="M10 15.5v-7l6 3.5-6 3.5z" fill="currentColor" />
        </svg>
      );
    case "radio":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 7h16v12H4V7zm2 2v8h12V9H6zm13.5 3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM7 5l10-2 .4 1.9L7.4 7H4.8L7 5z" />
        </svg>
      );
    case "arrowRight":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M13 5l7 7-7 7v-4H4v-6h9V5z" />
        </svg>
      );
    case "verified":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 2l2.2 2.7 3.4.6-1.3 3.2 1.3 3.2-3.4.6L12 18l-2.2-2.7-3.4-.6 1.3-3.2-1.3-3.2 3.4-.6L12 2zm-1.2 10.2l-2-2 1.1-1.1 1 1 3.2-3.2 1.1 1.1-4.4 4.2z" />
        </svg>
      );
  }
}

export default function HeroLive({ isLive, latestVideo }: HeroLiveProps) {
  const videoTitle = latestVideo?.title ?? "Enseñanza reciente";
  const thumb = latestVideo?.thumbnail_url ?? "/placeholder-video.jpg";
  const latestHref = latestVideo?.slug ? `/videos/${latestVideo.slug}` : "/videos";

  const latestVideoIdPath = "latestVideo.youtube_video_id";
  const liveMissingLatestIdMessage = `Live sin ${latestVideoIdPath}`;
  const liveVideoId = isLive ? latestVideo?.youtube_video_id : undefined;
  const liveSrc = liveVideoId ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=1` : null;

  return (
    <section aria-label="Hero principal" className="relative w-full">
      <div className="grid items-start gap-10 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-sm text-black/70 border border-black/10">
            <Icon name="verified" className="w-[18px] h-[18px] fill-current" />
            {isLive ? "En vivo ahora" : "Contenido oficial · Actualizado semanalmente"}
          </p>

          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-black">
           Donde el Espíritu Santo en cada corazón
            <span className="block">expresa la vida de Jesús </span>
            <span className="block text-black/70">en cada uno de sus hijos.</span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-black/70 max-w-2xl">
            Accedé a las enseñanzas del canal <strong>@JoaquinPensa</strong>, organizadas para estudiar, volver a ver y
            compartir con claridad.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href={latestHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 bg-primary text-black font-medium ring-1 ring-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] active:brightness-90"
              aria-label="Ver lo más reciente"
            >
              <Icon name="play" className="w-5 h-5 fill-current" />
              Ver lo más reciente
            </Link>

            <Link
              href="/videos"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 bg-white/60 backdrop-blur-sm text-black ring-1 ring-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] active:bg-white/70"
              aria-label="Ir a la biblioteca"
            >
              Ir a la biblioteca
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            {[
              { k: "Ritmo", v: "Semanal" },
              { k: "Fuente", v: "Canal oficial" },
              { k: "Acceso", v: "Gratis" },
            ].map((x) => (
              <div
                key={x.k}
                className="rounded-2xl bg-white/60 backdrop-blur-sm ring-1 ring-black/10 p-4"
              >
                <p className="text-sm text-black/60">{x.k}</p>
                <p className="mt-1 font-medium text-black">{x.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <aside className="lg:col-span-5">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-2xl bg-primary/20 blur-3xl"
            />
            <div className="relative rounded-2xl bg-white/60 backdrop-blur-sm ring-1 ring-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-black/60">Encuentro</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-black">Vivo semanal</h3>
                  <p className="mt-2 text-black/70">
                    {isLive ? "Transmitiendo ahora." : "Cuando esté en vivo, aparece automáticamente aquí."}
                  </p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/80">
                  <Icon name={isLive ? "radio" : "youtube"} className="w-[22px] h-[22px] fill-current" />
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {isLive ? (
                  <div className="space-y-3">
                    <div className="aspect-video rounded-2xl bg-black overflow-hidden shadow-inner">
                      {liveSrc ? (
                        <iframe
                          src={liveSrc}
                          title={`YouTube live player — ${videoTitle}`}
                          className="w-full h-full"
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/80 text-sm px-6 text-center">
                          {liveMissingLatestIdMessage}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded inline-flex items-center gap-1 uppercase tracking-tight">
                        <Icon name="radio" className="w-3 h-3 fill-current" />
                        Transmitiendo
                      </span>
                      <p className="text-sm font-medium text-black/70 truncate">{videoTitle}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href={latestHref}
                      className="relative block aspect-video rounded-xl overflow-hidden ring-1 ring-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
                      aria-label={`Abrir: ${videoTitle}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt={videoTitle}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="rounded-full bg-primary px-4 py-4 shadow-lg">
                          <Icon name="play" className="w-6 h-6 fill-current" />
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/videos"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-black py-3.5 font-semibold ring-1 ring-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] active:brightness-90"
                      aria-label="Ver últimos videos"
                    >
                      Ver últimos videos <Icon name="arrowRight" className="w-4 h-4 fill-current" />
                    </Link>

                    <div className="rounded-2xl bg-black/5 p-4 border border-black/10">
                      <p className="text-sm text-black/60">Transparencia</p>
                      <p className="mt-1 text-sm text-black/70">
                        “Enseñanzas recientes” usa datos reales desde Supabase (sin badges inventados).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
