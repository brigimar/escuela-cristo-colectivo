type Props = { params: { slug: string } }
export default async function PostDetail({ params }: Props) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl break-words">
        {params.slug}
      </h1>
      <p className="mt-4 text-sm text-neutral-600">Contenido en preparación.</p>
    </main>
  )
}
