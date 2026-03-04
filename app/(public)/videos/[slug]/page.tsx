import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getVideoBySlug } from "@/features/videos/queries"
import { excerpt } from "@/lib/text/excerpt"

type Props = { params: { slug: string } }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await getVideoBySlug(params.slug)
  if (!video) return { title: "Videos | Escuela de Cristo" }

  const description = excerpt(video.description ?? "", 160)
  const title = `${video.title} | Escuela de Cristo`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: video.thumbnail_url ? [video.thumbnail_url] : undefined
    }
  }
}

export default async function VideoDetail({ params }: Props) {
  const video = await getVideoBySlug(params.slug)
  if (!video) return notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-black leading-tight">{video.title}</h1>
      {video.published_at ? <p className="mt-2 text-sm text-slate-600">{new Date(video.published_at).toLocaleString("es-AR")}</p> : null}
      <div className="embed-16x9">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtube_video_id}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <p className="mt-4 text-sm">
        <a className="underline" href="/videos">
          Volver a videos
        </a>
        {" · "}
        <a className="underline" href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`} target="_blank" rel="noreferrer">
          Ver en YouTube
        </a>
      </p>

      {video.description ? (
        <pre className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{video.description}</pre>
      ) : (
        <p className="mt-6 text-sm text-slate-600">Sin descripción.</p>
      )}
    </main>
  )
}
