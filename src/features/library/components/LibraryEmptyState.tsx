type LibraryEmptyStateProps = {
  title?: string
  description?: string
}

export function LibraryEmptyState({
  title = "Sin resultados",
  description = "No hay libros que coincidan con los filtros seleccionados.",
}: LibraryEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[#dac9a7] bg-[#fffaf0] p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <p className="text-lg font-semibold text-[#2b2114]">{title}</p>
      <p className="mt-2 text-sm text-[#5b4b35]">{description}</p>
    </div>
  )
}
