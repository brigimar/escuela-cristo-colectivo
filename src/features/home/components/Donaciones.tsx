import Link from "next/link"

// --- Iconos SVG Minimalistas ---
function IconMercadoPago(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 8h16M4 16h16M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPayPal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M17.5 7.5c0-2-1.5-3.5-3.5-3.5H8a1 1 0 0 0-1 1v14l3.5-1v-4h3c2.5 0 4.5-2 4.5-4.5 0-1-.5-2-1.5-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 10.5c0 2.5-2 4.5-4.5 4.5h-3l-1.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconBank(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 12h12m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type DonationKind = "mercadopago" | "paypal" | "transferencia"

type DonationOption = {
  id: DonationKind
  title: string
  description: string
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
  href?: string
  buttonText: string
}

const DEFAULT_LINKS: Record<DonationKind, string> = {
  mercadopago: "https://link.mercadopago.com.ar/ofrendaesvoluntaria",
  paypal: "mailto:K_mila.dh@hotmail.com",
  transferencia: "https://wise.com/pay/r/Miljl9L03wIpWUc",
}

const BASE_OPTIONS: Omit<DonationOption, "href">[] = [
  {
    id: "mercadopago",
    title: "Mercado Pago",
    description: "Aporte rápido y seguro en pesos argentinos. Único pago o suscripción.",
    Icon: IconMercadoPago,
    buttonText: "Donar con MP"
  },
  {
    id: "paypal",
    title: "PayPal",
    description: "Para aportes internacionales desde cualquier parte del mundo en dólares. Enviá tu donación a K_mila.dh@hotmail.com.",
    Icon: IconPayPal,
    buttonText: "Donar con PayPal"
  },
  {
    id: "transferencia",
    title: "Otros medios",
    description: "Wise (internacional) · Llave PIX Brasil: CPF 800.622.699-76. Transferencias directas desde cualquier país.",
    Icon: IconBank,
    buttonText: "Donar con Wise"
  }
]

export function Donations({
  links,
  note = "La generosidad es una ofrenda: sin ataduras y por amor"
}: {
  links?: Partial<Record<DonationKind, string>>
  note?: string
}) {
  const donationOptions: DonationOption[] = BASE_OPTIONS.map((o) => ({
    ...o,
    href: links?.[o.id] ?? DEFAULT_LINKS[o.id],
  }))

  return (
    <section aria-labelledby="donaciones-title" className="py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-xs font-semibold tracking-widest uppercase text-neutral-500">Sostener</div>
          <h2 id="donaciones-title" className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Generosidad
          </h2>
          <p className="mt-3 text-base text-neutral-600 sm:text-lg">Si este enseñanza te edifica, podés colaborar y sostenerla.</p>
        </div>

        {/* Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {donationOptions.map((option) => {
            const disabled = !option.href

            return (
              <article
                key={option.id}
                className={[
                  "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 md:p-8",
                  "border border-neutral-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
                ].join(" ")}
              >
                <div>
                  <div className="inline-flex items-center justify-center rounded-xl bg-neutral-100 p-3 text-neutral-800 ring-1 ring-neutral-200/50">
                    <option.Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-neutral-900">{option.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{option.description}</p>
                </div>

                <div className="mt-8">
                  {disabled ? (
                    <div
                      aria-disabled="true"
                      className={[
                        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
                        "text-sm font-medium border transition-colors duration-200",
                        "cursor-not-allowed bg-neutral-100 text-neutral-400 border-neutral-200"
                      ].join(" ")}
                    >
                      Próximamente
                    </div>
                  ) : (
                    <Link
                      href={option.href!}
                      className={[
                        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
                        "text-sm font-medium border transition-colors duration-200",
                        "bg-neutral-50 text-neutral-900 border-neutral-200 group-hover:bg-amber-300 group-hover:border-amber-300 group-hover:text-amber-950",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                      ].join(" ")}
                    >
                      {option.buttonText}
                      <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-neutral-400">{note}</p>
        </div>
      </div>
    </section>
  )
}
