import Link from "next/link"

// --- Iconos SVG Minimalistas ---
function IconYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTikTok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTelegram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconEmail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconExternalLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// --- Componente Principal ---
export function Channels() {
  const channels = [
    {
      id: "youtube",
      title: "YouTube",
      description: "Canal oficial: @JoaquinPensa. Enseñanzas completas y directos.",
      icon: <IconYouTube className="h-6 w-6" />,
      href: "https://youtube.com/@joaquinpensa", // Reemplazar con link real
      buttonText: "Ver en el sitio",
    },
    {
      id: "instagram",
      title: "Instagram",
      description: "Clips cortos, reflexiones y novedades del día a día.",
      icon: <IconInstagram className="h-6 w-6" />,
      href: "https://www.instagram.com/joaco.pensa", 
      buttonText: "Seguir",
    },
    {
      id: "tiktok",
      title: "TikTok",
      description: "Fragmentos destacados y enseñanzas breves en video.",
      icon: <IconTikTok className="h-6 w-6" />,
      href: "https://www.tiktok.com/@joaco.pensa", 
      buttonText: "Ver perfil",
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      description: "Comunidad oficial Cristo Colectivo.",
      icon: <IconWhatsApp className="h-6 w-6" />,
      href: "https://chat.whatsapp.com/JSjT5PypZgPGbuj9wny0Qa", 
      buttonText: "Unirme",
    },
    {
      id: "telegram",
      title: "Telegram",
      description: "Canal de difusión con material de estudio y audios.",
      icon: <IconTelegram className="h-6 w-6" />,
      href: "https://t.me/labiblianarrada", 
      buttonText: "Suscribirme",
    },
    {
      id: "email",
      title: "Email",
      description: "Newsletter mensual con resúmenes y próximos estudios.",
      icon: <IconEmail className="h-6 w-6" />,
      href: "#", 
      buttonText: "Suscribirme",
    },
  ]

  return (
    <section aria-labelledby="canales-title" className="py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
            Conectar
          </div>
          <h2
            id="canales-title"
            className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
          >
            Canales y redes
          </h2>
          <p className="mt-3 text-base text-neutral-600 sm:text-lg">
            Suscribite y recibí actualizaciones por los canales oficiales.
          </p>
        </div>

        {/* Grid de 6 Tarjetas */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={[
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6",
                "border border-neutral-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
              ].join(" ")}
            >
              <div>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200/50 transition-colors group-hover:bg-amber-100 group-hover:text-amber-900 group-hover:ring-amber-200">
                    {channel.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {channel.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {channel.description}
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href={channel.href}
                  className={[
                    "inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5",
                    "text-sm font-medium text-neutral-900 border border-neutral-200",
                    "transition-colors duration-200 group-hover:bg-neutral-50",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                  ].join(" ")}
                >
                  <IconExternalLink className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900" />
                  {channel.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}