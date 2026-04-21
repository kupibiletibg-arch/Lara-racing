'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Logo } from '@/components/brand/Logo'
import { locales } from '@/lib/i18n/config'
import clsx from 'clsx'

export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const altLocale = locales.find(l => l !== locale) ?? 'en'
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/'
  const altHref = `/${altLocale}${pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale}`

  const links = [
    { href: `/${locale}`, label: t('home'), exact: true },
    { href: `/${locale}/calendar`, label: t('calendar') },
    { href: `/${locale}/track`, label: t('track') },
    { href: `/${locale}/facilities`, label: t('facilities') },
    { href: `/${locale}/partners`, label: t('partners') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  // Close on route change + lock page scroll while open + ESC to close.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/70 border-b rule">
      <div className="relative w-full px-2 md:px-3 h-24 md:h-28 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="flex items-center hover:opacity-90 transition-opacity"
          aria-label="A1 Motor Park"
        >
          <Logo />
        </Link>

        <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1 text-[13px] font-mono tracking-mono uppercase">
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
            aria-label={`Switch to ${altLocale.toUpperCase()}`}
            className="inline-flex items-center gap-2 font-mono tracking-mono uppercase text-[14px] text-ink/60 hover:text-ink transition-colors px-2.5 py-1.5 border rule"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a14 14 0 0 1 0 18" />
              <path d="M12 3a14 14 0 0 0 0 18" />
            </svg>
            {altLocale.toUpperCase()}
          </Link>

          {/* Hamburger — visible below lg, toggles the mobile menu overlay */}
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="lg:hidden inline-flex flex-col justify-center items-center gap-1.5 w-11 h-11 border rule text-ink/80 hover:text-ink"
          >
            <span
              className={clsx(
                'block h-[2px] w-5 bg-current transition-transform',
                menuOpen && 'translate-y-[7px] rotate-45',
              )}
            />
            <span
              className={clsx(
                'block h-[2px] w-5 bg-current transition-opacity',
                menuOpen && 'opacity-0',
              )}
            />
            <span
              className={clsx(
                'block h-[2px] w-5 bg-current transition-transform',
                menuOpen && '-translate-y-[7px] -rotate-45',
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      <div
        id="mobile-nav"
        className={clsx(
          'lg:hidden fixed inset-0 top-24 z-30 bg-bg/70 backdrop-blur-md transition-opacity duration-200',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col gap-1 px-5 py-8">
          {links.map(l => {
            const active =
              l.exact
                ? pathname === l.href
                : pathname === l.href || pathname.startsWith(`${l.href}/`)
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'font-display font-medium text-[22px] py-3 px-1 border-b rule transition-colors',
                  active ? 'text-brand' : 'text-ink/85 hover:text-ink',
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
