import React from "react";
import Link from "next/link";
import {
  PRIMARY_BUTTON_CLASS,
  PREMIUM_CARD_BASE_CLASS,
  PREMIUM_CARD_INTERACTIVE_CLASS,
  premiumChipClass,
  SECONDARY_BUTTON_CLASS,
} from "@/features/home/components/ui";

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

  const liveVideoId = isLive ? latestVideo?.youtube_video_id : undefined;
  const liveSrc = liveVideoId
    ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=1`
    : null;

  return (
    <section aria-label="Hero principal" className="relative w-full overflow-x-clip">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-6 xl:gap-8">
        <div className="order-1 w-full lg:col-span-6">
          <p className={`inline-flex max-w-full items-center gap-2 leading-tight sm:text-sm ${premiumChipClass("warm")}`}>
            <Icon name="verified" className="h-4 w-4 fill-current sm:h-[18px] sm:w-[18px]" />
            {isLive ? "En vivo ahora" : "Contenido oficial"}
          </p>

          <h1 className="mt-3 max-w-[11ch] text-[1.4rem] font-semibold leading-[1.02] tracking-tight text-black min-[430px]:max-w-[12ch] min-[430px]:text-[2.5rem] sm:mt-4 sm:max-w-[14ch] sm:text-[3.1rem] lg:text-[4rem]">
            Cristo en nosotros, 
            <span className="block">la esperanza de gloria</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-black/70 sm:mt-4 sm:text-base sm:leading-7 lg:text-lg">
            Accede a las enseñanzas del canal <strong>@JoaquinPensa</strong>, organizadas para estudiar, volver a ver y compartir.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap">
            <Link
              href={latestHref}
              className={`${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}
              aria-label="Ver lo más reciente"
            >
              <Icon name="play" className="h-5 w-5 fill-current" />
              Ver lo más reciente
            </Link>

            <Link
              href="/videos"
              className={`${SECONDARY_BUTTON_CLASS} w-full sm:w-auto`}
              aria-label="Ir a la biblioteca"
            >
              Ir a la biblioteca
            </Link>
          </div>

          <div className="mt-6 hidden max-w-2xl gap-3 sm:grid sm:grid-cols-3">
            {[
              { k: "Ritmo", v: "Semanal" },
              { k: "Fuente", v: "Canal oficial" },
              { k: "Acceso", v: "Gratis" },
            ].map((x) => (
              <div key={x.k} className={`${PREMIUM_CARD_BASE_CLASS} p-3.5 sm:p-4`}>
                <p className="text-xs text-black/60 sm:text-sm">{x.k}</p>
                <p className="mt-1 text-sm font-medium text-black sm:text-base">{x.v}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="order-2 w-full pt-1 sm:pt-2 lg:col-span-6 lg:pt-0">
          <div className="relative mx-0 w-full max-w-none sm:mx-auto sm:max-w-[38rem] lg:max-w-none">
            <div className={`relative overflow-hidden p-3 sm:p-4 lg:p-5 ${PREMIUM_CARD_BASE_CLASS} ${PREMIUM_CARD_INTERACTIVE_CLASS}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-black/60 sm:text-sm">Encuentro</p>
                  <h3 className="mt-1 text-base font-semibold tracking-tight text-black sm:text-lg">
                    Vivo semanal
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-black/70">
                    {isLive
                      ? "Transmitiendo ahora."
                      : "Cuando esté en vivo, aparece automáticamente aquí."}
                  </p>
                </div>

                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0dfb9] text-[#6e5421] sm:h-10 sm:w-10">
                  <Icon
                    name={isLive ? "radio" : "youtube"}
                    className="h-4 w-4 fill-current sm:h-5 sm:w-5"
                  />
                </span>
              </div>

              <div className="mt-3.5 space-y-3">
                {isLive ? (
                  <>
                    <div className="aspect-[16/9.6] overflow-hidden rounded-2xl bg-black shadow-inner sm:aspect-[16/9.2] lg:aspect-[16/8.1]">
                      {liveSrc ? (
                        <iframe
                          src={liveSrc}
                          title={`YouTube live player - ${videoTitle}`}
                          className="h-full w-full"
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white/80">
                          Live sin latestVideo.youtube_video_id
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="inline-flex w-fit items-center gap-1 rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-white">
                        <Icon name="radio" className="h-3 w-3 fill-current" />
                        Transmitiendo
                      </span>
                      <p className="min-w-0 truncate text-sm font-medium text-black/70">
                        {videoTitle}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href={latestHref}
                      className="relative block aspect-[16/9.6] overflow-hidden rounded-2xl ring-1 ring-black/10 sm:aspect-[16/9.2] lg:aspect-[16/8.1]"
                      aria-label={`Abrir: ${videoTitle}`}
                    >
                      <img
                        src={thumb}
                        alt={videoTitle}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="rounded-full bg-[linear-gradient(180deg,#e6c24a_0%,#d5ad2f_100%)] p-3 text-[#1f1b16] shadow-lg sm:p-4">
                          <Icon name="play" className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/videos"
                      className={`${PRIMARY_BUTTON_CLASS} w-full`}
                      aria-label="Ver últimos videos"
                    >
                      Ver últimos videos
                      <Icon name="arrowRight" className="h-4 w-4 fill-current" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}


