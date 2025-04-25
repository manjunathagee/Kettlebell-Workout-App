import type React from "react"
import "@/app/globals.css"
import { Poppins, Montserrat } from "next/font/google"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
})

export const metadata = {
  title: "Manjunatha C - Senior Frontend Engineer",
  description: "Portfolio of Manjunatha C, a Senior Frontend Engineer with 10+ years of experience",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${montserrat.variable} font-sans bg-slate-950 text-white`}>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
