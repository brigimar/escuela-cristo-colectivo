export type VideoVM = {
  title: string
  href: string
  thumbnail?: string
  publishedAt?: string
}

export function toVideoVMs(_rows: unknown[]): VideoVM[] {
  return []
}
