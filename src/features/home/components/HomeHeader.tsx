"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon, PrimaryButton, SecondaryButton } from "@/features/home/components/ui";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const navItems = [
  { href: "#ensenanzas", label: "Enseñanzas" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "#biblioteca", label: "Biblioteca" },
  { href: "/#donaciones", label: "Donaciones" },
  { href: "/#canales", label: "Canales" },
  { href: "#manifiesto", label: "Manifiesto" },
];

export function HomeHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = "home-mobile-nav";

  return (
    <header className="sticky top-0 z-50 border-b border-[#d8c9ab] bg-[#f8f1e4]/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="flex min-h-[72px] items-center justify-between gap-3 py-3 lg:min-h-[84px] lg:py-0">
          <Link
            href="/"
            className="inline-flex min-w-0 max-w-[78%] items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f6a11] sm:max-w-none"
            onClick={() => setIsOpen(false)}
          >
            <span className="relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#fffaf0] ring-1 ring-[#cfbb93] sm:h-11 sm:w-11 lg:h-12 lg:w-12">
              <Image
  src="/logo.png"
  alt="Escuela de Cristo"
  fill
  priority
  sizes="(max-width: 640px) 40px, (max-width: 1024px) 44px, 48px"
  className="object-contain p-0"
/>
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d6c39b] bg-[#fffaf0] text-[#2f2618] transition hover:bg-[#f3e7cd] lg:hidden"
            aria-expanded={isOpen}
            aria-controls={menuId}
            aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="material-symbols-rounded text-[24px]" aria-hidden="true">
              {isOpen ? "close" : "menu"}
            </span>
          </button>

          <div className="hidden lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-6">
            <nav
              className="flex items-center justify-end gap-5 xl:gap-6 text-sm text-[#5f5037]"
              aria-label="Navegación principal"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  className="rounded transition-colors hover:text-[#1f1a12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f6a11]"
                  href={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <SecondaryButton href="#canales" icon="notifications">
                Recibir recordatorio
              </SecondaryButton>
              <PrimaryButton href="/videos" icon="play_circle">
                Ver enseñanzas
              </PrimaryButton>
            </div>
          </div>
        </div>

        <div
          id={menuId}
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-200 ease-out lg:hidden",
            isOpen ? "max-h-[42rem] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="pb-4">
            <nav
              aria-label="Navegación móvil"
              className="mb-3 rounded-2xl border border-[#d8c8a8] bg-[#fffaf0] p-2 shadow-[0_10px_28px_rgba(62,44,16,0.12)]"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-4 py-3 text-sm text-[#3d3120] transition-colors hover:bg-[#f3e7cd] hover:text-[#1f1a12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f6a11] sm:text-base"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="grid gap-2 sm:grid-cols-2">
              <SecondaryButton
                href="#canales"
                icon="notifications"
                className="w-full justify-center"
              >
                Recibir recordatorio
              </SecondaryButton>

              <PrimaryButton
                href="/videos"
                icon="play_circle"
                className="w-full justify-center"
              >
                Ver enseñanzas
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HomeHeader;