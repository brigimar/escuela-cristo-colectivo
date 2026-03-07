import React from "react";
import Link from "next/link";

/**
 * HeroLive (optimized)
 * - No hard dependency on lucide-react (optional icons via inline SVG fallback)
 * - Better a11y + semantics + responsive sizing
 * - No markdown inside JSX
 * - Lazy iframe + safer attributes
 */

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
  name: "play" | "youtube" | "radio" | "arrowRight";
  className?: string;
}) {
  // Minimal inline SVGs (no dependency)
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
  }
}

export default function HeroLive({
  isLive,
  latestVideo,
}: HeroLiveProps) {
  const videoTitle = latestVideo?.title ?? "Enseñanza reciente";
  const thumb = latestVideo?.thumbnail_url ?? "/placeholder-video.jpg";
  const latestHref = latestVideo?.slug ? `/videos/${latestVideo.slug}` : "/videos";
  const liveVideoId = isLive ? latestVideo?.youtube_video_id : undefined;
  const liveSrc = liveVideoId ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=1` : null;

  return (
    <section
      aria-label="Hero principal"
      className="relative w-full max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-12 lg:py-20 font-['Manrope']"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Copy */}
        <header className="space-y-6">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100 text-[11px] font-extrabold tracking-wide uppercase">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span
                className={[
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
                  isLive ? "bg-red-500" : "bg-yellow-400",
                ].join(" ")}
              />
              <span
                className={[
                  "relative inline-flex rounded-full h-2 w-2",
                  isLive ? "bg-red-600" : "bg-yellow-500",
                ].join(" ")}
              />
            </span>
            <span>{isLive ? "En vivo ahora" : "Contenido oficial · actualizado"}</span>
          </div>

          <h1 className="text-slate-900 font-extrabold tracking-tight leading-[1.05] text-[clamp(2.2rem,5vw,4.5rem)]">
            Enseñanzas claras,{" "}
            <span className="block text-slate-400 font-normal italic text-[clamp(1.8rem,4vw,3.75rem)]">
              profundas y prácticas.
            </span>
          </h1>

          <p className="text-slate-600 leading-relaxed max-w-xl text-base sm:text-lg">
            Accedé a las enseñanzas del canal{" "}
            <span className="font-extrabold text-slate-900">@JoaquinPensa</span>,
            organizadas para estudiar, volver a ver y compartir con claridad.
          </p>

          {/* CTAs */}
          <nav aria-label="Acciones principales" className="flex flex-wrap gap-3 sm:gap-4 pt-2">
            <Link
              href={latestHref}
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-extrabold transition-transform active:scale-[0.98] hover:scale-[1.02] shadow-lg shadow-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
              aria-label="Ver lo más reciente"
            >
              <Icon name="play" className="w-5 h-5 fill-current" />
              Ver lo más reciente
            </Link>

            <Link
              href="/videos"
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-extrabold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
              aria-label="Ir a la biblioteca"
            >
              Ir a la biblioteca
            </Link>
          </nav>
        </header>

        {/* Visual */}
        <div className="relative group">
          <div
            aria-hidden="true"
            className="absolute -inset-4 bg-gradient-to-r from-yellow-200 to-orange-100 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-60 transition duration-700"
          />

          <div className="relative bg-white border border-slate-100 rounded-[2.25rem] shadow-2xl overflow-hidden p-5 sm:p-6 lg:p-8">
            {isLive ? (
              <div className="space-y-4">
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
                    <div className="w-full h-full flex items-center justify-center text-slate-200 text-sm px-6 text-center">
                      En vivo: falta live_video_id
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 px-1">
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded inline-flex items-center gap-1 uppercase tracking-tight">
                    <Icon name="radio" className="w-3 h-3 fill-current" />
                    Transmitiendo
                  </span>
                  <p className="text-sm font-semibold text-slate-600 truncate">
                    {videoTitle}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-slate-400 text-xs font-extrabold uppercase tracking-widest">
                      Encuentro
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">
                      Vivo semanal
                    </h2>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-2xl" aria-hidden="true">
                    <Icon name="youtube" className="w-6 h-6 fill-yellow-600 text-yellow-600" />
                  </div>
                </div>

                {/* Thumbnail */}
                <Link
                  href={latestHref}
                  className="relative block aspect-video rounded-2xl overflow-hidden shadow-md group/thumb focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                  aria-label={`Abrir: ${videoTitle}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt={videoTitle}
                    className="w-full h-full object-cover transition duration-500 group-hover/thumb:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="bg-yellow-400 p-4 rounded-full shadow-xl transform transition group-hover/thumb:scale-110">
                      <Icon name="play" className="w-6 h-6 fill-slate-900 text-slate-900" />
                    </div>
                  </div>
                </Link>

                <Link
                  href="/videos"
                  className="w-full inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-3.5 rounded-2xl font-extrabold transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                  aria-label="Ver la biblioteca"
                >
                  Ver últimos videos <Icon name="arrowRight" className="w-4 h-4 fill-current" />
                </Link>

                <div className="pt-5 border-t border-slate-100">
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">
                      Transparencia
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      “Enseñanzas recientes” usa datos reales desde Supabase (sin badges inventados).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
