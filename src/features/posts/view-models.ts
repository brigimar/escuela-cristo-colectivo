export type PostVM = {
  title: string
  href: string
  excerpt?: string
  publishedAt?: string
}

export function toPostVMs(_rows: unknown[]): PostVM[] {
  return []
}
