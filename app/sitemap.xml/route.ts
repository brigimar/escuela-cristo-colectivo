import { listAllVideoSitemapEntries } from "@/features/videos/queries"
import { getSiteUrl } from "@/lib/site/url"
import { escapeXml } from "@/lib/site/xml"

export const revalidate = 3600

function toLastmod(entry: { published_at?: string | null; updated_at?: string | null }) {
  const raw = entry.published_at ?? entry.updated_at
  if (!raw) return null
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export async function GET() {
  const siteUrl = getSiteUrl()
  const entries = await listAllVideoSitemapEntries()

  const urls: Array<{ loc: string; lastmod?: string }> = [
    { loc: `${siteUrl}/` },
    { loc: `${siteUrl}/videos` },
    ...entries.map((e) => {
      const lastmod = toLastmod(e)
      return { loc: `${siteUrl}/videos/${e.slug}`, lastmod: lastmod ?? undefined }
    })
  ]

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => {
        const lastmod = u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : ""
        return `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${lastmod}\n  </url>`
      })
      .join("\n") +
    `\n</urlset>\n`

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  })
}

