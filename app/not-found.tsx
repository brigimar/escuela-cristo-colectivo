import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">Página no encontrada</h1>
      <p className="text-sm opacity-80">
        El recurso que buscás no existe o fue movido.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/" className="underline">
          Ir al inicio
        </Link>
        <Link href="/videos" className="underline">
          Ver videos
        </Link>
      </div>
    </main>
  );
}
