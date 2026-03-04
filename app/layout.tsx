import "./globals.css"
import { Manrope } from "next/font/google"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@100..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} font-display`}>{children}</body>
    </html>
  )
}
