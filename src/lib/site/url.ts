function stripQuotes(value: string) {
  const v = value.trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1)
  return v
}

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL
  if (!raw) return "http://localhost:3000"
  const cleaned = stripQuotes(raw).replace(/\/+$/g, "")
  if (/^https?:\/\//i.test(cleaned)) return cleaned
  return `https://${cleaned}`
}

export function getPublicLinks() {
  const youtube = process.env.NEXT_PUBLIC_YOUTUBE_URL
  const community = process.env.NEXT_PUBLIC_COMMUNITY_URL
  const telegram = process.env.NEXT_PUBLIC_TELEGRAM_URL
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL

  return {
    youtubeUrl: youtube ? stripQuotes(youtube) : "https://www.youtube.com/@JoaquinPensa",
    telegramUrl: telegram ? stripQuotes(telegram) : "#",
    whatsappUrl: whatsapp ? stripQuotes(whatsapp) : "#",
    communityUrl: community ? stripQuotes(community) : "#"
  }
}

