import Link from "next/link"
import type { Metadata } from "next"
import { VideoFilters } from "@/features/videos/components/VideoFilters"
import { listPublishedVisibleVideoCatalog } from "@/features/videos/queries"
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

type VideosPageProps = {
  searchParams?: {
    category?: string
    author?: string
  }
}

function cleanParam(value: string | undefined): string {
  return (value || "").trim()
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const selectedCategory = cleanParam(searchParams?.category)
  const selectedAuthor = cleanParam(searchParams?.author)
  const videos = await listPublishedVisibleVideoCatalog(120)
  const categories = [...new Set(videos.map((video) => video.category))].sort((a, b) => a.localeCompare(b, "es"))
  const authors = [...new Set(videos.map((video) => video.author))].sort((a, b) => a.localeCompare(b, "es"))
  const filteredVideos = videos.filter((video) => {
    if (selectedCategory && video.category !== selectedCategory) return false
    if (selectedAuthor && video.author !== selectedAuthor) return false
    return true
  })

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Enseñanzas recientes</h1>
      </div>
      <p className="mt-2 text-sm text-[#5a4c34]">Filtrá enseñanzas por categoría y autor.</p>

      <VideoFilters
        categories={categories}
        authors={authors}
        selectedCategory={selectedCategory}
        selectedAuthor={selectedAuthor}
      />

      {filteredVideos.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#d7c6a8] bg-[#fffaf0] p-6 text-center text-sm text-[#5a4c34]">
          No encontramos enseñanzas con esos filtros.
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((v) => {
            const dateLabel = v.published_at ? new Date(v.published_at).toLocaleDateString("es-AR") : null
            const description = excerpt(v.description ?? "", 160)
            return (
              <li key={v.video_id}>
                <Link
                  className="block overflow-hidden rounded-xl border border-black/10 bg-white/80 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2"
                  href={v.url}
                >
                  {v.thumbnail_url ? (
                    <img className="aspect-video w-full object-cover" src={v.thumbnail_url} alt={v.title} loading="lazy" />
                  ) : (
                    <div className="aspect-video w-full bg-black/5" />
                  )}
                  <div className="min-w-0 p-4">
                    <h2 className="text-sm font-bold leading-snug line-clamp-2 break-words">{v.title}</h2>
                    {dateLabel ? <p className="mt-2 text-xs text-slate-600">{dateLabel}</p> : null}
                    <p className="mt-2 text-xs text-slate-600">{v.category} · {v.author}</p>
                    {description ? <p className="mt-2 text-xs text-slate-600 line-clamp-3 break-words">{description}</p> : null}
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
