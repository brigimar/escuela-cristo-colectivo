type VideoFiltersProps = {
  categories: string[]
  authors: string[]
  selectedCategory: string
  selectedAuthor: string
}

export function VideoFilters({ categories, authors, selectedCategory, selectedAuthor }: VideoFiltersProps) {
  return (
    <form method="GET" action="/videos" className="mt-6 rounded-2xl border border-[#d7c6a8] bg-[#fffaf0] p-4 shadow-[0_6px_24px_rgba(68,49,19,0.08)] sm:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm text-[#3f3220]">
          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-[#725a3b]">Categoría</span>
          <select
            name="category"
            defaultValue={selectedCategory}
            className="h-11 rounded-xl border border-[#ccb48d] bg-[#fffdf6] px-3 text-sm text-[#2b2114] outline-none transition-colors focus:border-[#876c45]"
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-[#3f3220]">
          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-[#725a3b]">Autor</span>
          <select
            name="author"
            defaultValue={selectedAuthor}
            className="h-11 rounded-xl border border-[#ccb48d] bg-[#fffdf6] px-3 text-sm text-[#2b2114] outline-none transition-colors focus:border-[#876c45]"
          >
            <option value="">Todos</option>
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2 lg:col-span-2 flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2f2314] px-4 text-sm font-medium text-[#f8efdc] transition-colors hover:bg-[#22180e]"
          >
            Aplicar filtros
          </button>
          <a
            href="/videos"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#cdb58d] bg-[#fff4df] px-4 text-sm font-medium text-[#3a2b19] transition-colors hover:bg-[#f6e8cc]"
          >
            Limpiar filtros
          </a>
        </div>
      </div>
    </form>
  )
}
