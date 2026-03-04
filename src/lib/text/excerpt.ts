export function excerpt(markdown: string, max = 160) {
  const plain = markdown.replace(/[*_`>#-]/g, " ").replace(/\s+/g, " ").trim()
  if (plain.length <= max) return plain
  const cut = plain.slice(0, max)
  const lastSpace = cut.lastIndexOf(" ")
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim() + "…"
}
