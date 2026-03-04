import { getSiteUrl } from "@/lib/site/url"

export const revalidate = 3600

export function GET() {
  const siteUrl = getSiteUrl()
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  })
}

