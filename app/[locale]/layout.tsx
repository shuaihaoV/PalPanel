import type { Metadata } from 'next'
import './globals.css'
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import TranslationsProvider from '@/locales/TranslationsProvider'

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'PalPanel',
  description: 'Palworld RCON Panel'
}

export default function RootLayout({
  children,
  params: {
    locale
  }
}: {
  children: React.ReactNode,
  params: {
    locale: string,
  }
}) {
  return (
    <html lang={locale}>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
          <TranslationsProvider
            locale={locale}
            namespaces={["login", "dashboard"]}
          >
            {children}
          </TranslationsProvider>
        <Toaster />
      </body>
    </html>

  )
}
