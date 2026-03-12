type LibraryHeroProps = {
  totalBooks: number
}

export function LibraryHero({ totalBooks }: LibraryHeroProps) {
  return (
    <section className="border-b border-[#dbcaa8] bg-[#efe4ce]">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#6d5a3f]">Escuela de Cristo</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1f1a12] sm:text-5xl">Biblioteca</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4b3f2d] sm:text-lg">
          Libros en PDF para lectura, estudio y descarga.
        </p>
        <p className="mt-5 inline-flex items-center rounded-full border border-[#c9b089] bg-[#f7f1e4] px-3 py-1 text-xs font-medium text-[#5f4c33]">
          {totalBooks} {totalBooks === 1 ? "libro publicado" : "libros publicados"}
        </p>
      </div>
    </section>
  )
}
