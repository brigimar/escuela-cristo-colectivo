import { Icon } from "@/features/home/components/ui";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2d261a] bg-[#1f1b16] text-[#f2e6cf]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-semibold">Escuela de Cristo</p>
            <p className="mt-1 text-sm text-[#bca983]">Contenido del canal oficial · Sitio para lectura y estudio</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#c8b894]">
            <a className="transition-colors hover:text-[#f9f1df]" href="#ensenanzas">Enseñanzas</a>
            <a className="transition-colors hover:text-[#f9f1df]" href="#preguntas">Preguntas</a>
            <a className="transition-colors hover:text-[#f9f1df]" href="#biblioteca">Biblioteca</a>
            <a className="transition-colors hover:text-[#f9f1df]" href="#donaciones">Donaciones</a>
            <a className="transition-colors hover:text-[#f9f1df]" href="#canales">Canales</a>
            <a className="transition-colors hover:text-[#f9f1df]" href="#manifiesto">Manifiesto</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 text-sm text-[#b6a27c] md:flex-row md:items-center">
          <p>© {year} Escuela de Cristo. Todos los derechos reservados.</p>
          <p className="inline-flex items-center gap-2">
            <Icon name="security" className="text-[18px]" />
            Videos reales desde Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
