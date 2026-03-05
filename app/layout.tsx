import "./globals.css"
import { Manrope } from "next/font/google"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        {/* Usamos Rounded para consistencia con Hero.tsx */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@100..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} font-display`}>
        {children}
      </body>
    </html>
  )
}
