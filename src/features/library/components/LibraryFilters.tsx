type LibraryFiltersProps = {
  categories: string[]
  authors: string[]
  selectedCategory: string
  selectedAuthor: string
  searchTitle: string
}

export function LibraryFilters({
  categories,
  authors,
  selectedCategory,
  selectedAuthor,
  searchTitle,
}: LibraryFiltersProps) {
  return (
    <form method="GET" action="/biblioteca" className="mb-8 rounded-2xl border border-[#d7c6a8] bg-[#fffaf0] p-4 shadow-[0_6px_24px_rgba(68,49,19,0.08)] sm:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm text-[#3f3220]">
          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-[#725a3b]">Categoria</span>
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

        <label className="flex flex-col gap-1.5 text-sm text-[#3f3220] md:col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-[#725a3b]">Buscar por titulo</span>
          <input
            type="search"
            name="title"
            defaultValue={searchTitle}
            placeholder="Ej: Camino de la Cruz"
            className="h-11 rounded-xl border border-[#ccb48d] bg-[#fffdf6] px-3 text-sm text-[#2b2114] outline-none transition-colors placeholder:text-[#7a6648] focus:border-[#876c45]"
          />
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2f2314] px-4 text-sm font-medium text-[#f8efdc] transition-colors hover:bg-[#22180e]"
          >
            Aplicar filtros
          </button>
          <a
            href="/biblioteca"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#cdb58d] bg-[#fff4df] px-4 text-sm font-medium text-[#3a2b19] transition-colors hover:bg-[#f6e8cc]"
          >
            Limpiar
          </a>
        </div>
      </div>
    </form>
  )
}
