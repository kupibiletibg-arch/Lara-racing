import type { Metadata } from 'next'
import { Roboto_Slab, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GrainOverlay } from '@/components/layout/GrainOverlay'
import { TopoBackground } from '@/components/layout/TopoBackground'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import '../globals.css'

const display = Roboto_Slab({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Inter_Tight({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'A1 Motor Park — Samokov, Bulgaria',
  description:
    "Bulgaria's first FIA Grade 3 circuit. 3.91 km, 15 turns, 585 m altitude. Opened 21 March 2026 in Samokov.",
  metadataBase: new URL('https://a1motorpark.example'),
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params
  if (!locales.includes(locale as Locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <TopoBackground />
        <GrainOverlay />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LoadingScreen />
          <div className="relative z-10 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
