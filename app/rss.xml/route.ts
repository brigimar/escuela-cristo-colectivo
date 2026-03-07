import { listVideosForRss } from "@/features/videos/queries"
import { excerpt } from "@/lib/text/excerpt"
import { getSiteUrl } from "@/lib/site/url"
import { escapeXml } from "@/lib/site/xml"

export const revalidate = 3600

function toRssDate(value: string | null | undefined) {
  if (!value) return new Date().toUTCString()
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return new Date().toUTCString()
  return d.toUTCString()
}

function guessMime(url: string) {
  const lower = url.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".webp")) return "image/webp"
  return "image/jpeg"
}

export async function GET() {
  const siteUrl = getSiteUrl()
  const items = await listVideosForRss(50)

  const now = new Date().toUTCString()

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n` +
    `<channel>\n` +
    `  <title>${escapeXml("Escuela de Cristo - Videos")}</title>\n` +
    `  <link>${escapeXml(`${siteUrl}/videos`)}</link>\n` +
    `  <description>${escapeXml("Últimos videos publicados en Escuela de Cristo.")}</description>\n` +
    `  <lastBuildDate>${escapeXml(now)}</lastBuildDate>\n` +
    items
      .map((v) => {
        const link = `${siteUrl}/videos/${v.slug}`
        const desc = excerpt(v.description ?? "", 160)
        const pubDate = toRssDate(v.published_at ?? v.updated_at ?? null)
        const enclosure =
          v.thumbnail_url && v.thumbnail_url.trim().length > 0
            ? `\n    <enclosure\n      url="${escapeXml(v.thumbnail_url)}"\n      type="${escapeXml(guessMime(v.thumbnail_url))}"\n    />`
            : ""

        return (
          `  <item>\n` +
          `    <title>${escapeXml(v.title)}</title>\n` +
          `    <link>${escapeXml(link)}</link>\n` +
          `    <guid isPermaLink="true">${escapeXml(link)}</guid>\n` +
          `    <pubDate>${escapeXml(pubDate)}</pubDate>\n` +
          `    <description>${escapeXml(desc)}</description>` +
          `${enclosure}\n` +
          `  </item>`
        )
      })
      .join("\n") +
    `\n</channel>\n</rss>\n`

  return new Response(body, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8"
    }
  })
}
