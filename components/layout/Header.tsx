'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Logo } from '@/components/brand/Logo'
import { locales } from '@/lib/i18n/config'
import clsx from 'clsx'

export function Header() {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const locale = useLocale()
  const pathname = usePathname()

  const altLocale = locales.find(l => l !== locale) ?? 'en'
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/'
  const altHref = `/${altLocale}${pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale}`

  const links = [
    { href: `/${locale}`, label: t('home'), exact: true },
    { href: `/${locale}/calendar`, label: t('calendar') },
    { href: `/${locale}/track`, label: t('track') },
    { href: `/${locale}/facilities`, label: t('facilities') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/70 border-b rule">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8 h-16 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="flex items-center hover:opacity-90 transition-opacity"
          aria-label="A1 Motor Park"
        >
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-[13px] font-mono tracking-mono uppercase">
          {links.slice(1).map(l => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  'px-3 py-2 transition-colors relative',
                  active ? 'text-brand' : 'text-ink/70 hover:text-ink',
                )}
              >
                {l.label}
                {active && (
                  <span className="absolute left-3 right-3 bottom-1 h-px bg-brand" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={altHref}
            className="font-mono tracking-mono uppercase text-[11px] text-ink/60 hover:text-ink transition-colors px-2 py-1 border rule"
          >
            {tc('switchTo')}
          </Link>
        </div>
      </div>
    </header>
  )
}
