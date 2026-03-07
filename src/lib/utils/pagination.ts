export function paginate(page: number, pageSize: number) {
  const p = Math.max(1, page || 1)
  const size = Math.max(1, pageSize || 20)
  const from = (p - 1) * size
  const to = from + size - 1
  return { from, to, size, page: p }
}
