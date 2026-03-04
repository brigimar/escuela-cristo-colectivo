import Link from "next/link"
import type { Metadata } from "next"
import { listVideos } from "@/features/videos/queries"
import { excerpt } from "@/lib/text/excerpt"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Videos | Escuela de Cristo",
  description: "Videos recientes de Escuela de Cristo.",
  openGraph: {
    title: "Videos | Escuela de Cristo",
    description: "Videos recientes de Escuela de Cristo."
  }
}

export default async function VideosPage() {
  const videos = await listVideos()

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight">Videos</h1>
      </div>

      {videos.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">Todavía no hay videos.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const dateLabel = v.published_at ? new Date(v.published_at).toLocaleDateString("es-AR") : null
            const description = excerpt(v.description ?? "", 160)
            return (
              <li key={v.youtube_video_id}>
                <Link
                  className="block overflow-hidden rounded-xl border border-black/10 bg-white/80 shadow-sm transition hover:shadow-md"
                  href={`/videos/${v.slug}`}
                >
                  {v.thumbnail_url ? (
                    <img className="aspect-video w-full object-cover" src={v.thumbnail_url} alt={v.title} />
                  ) : (
                    <div className="aspect-video w-full bg-black/5" />
                  )}
                  <div className="p-4">
                    <h2 className="text-sm font-bold leading-snug">{v.title}</h2>
                    {dateLabel ? <p className="mt-2 text-xs text-slate-600">{dateLabel}</p> : null}
                    {description ? <p className="mt-2 text-xs text-slate-600">{description}</p> : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
