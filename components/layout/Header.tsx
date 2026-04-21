'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Logo } from '@/components/brand/Logo'
import { locales } from '@/lib/i18n/config'
import clsx from 'clsx'

function InstagramIcon({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 21.95V13.5h2.83l.42-3.3h-3.25V8.1c0-.95.27-1.6 1.63-1.6h1.74V3.57a23.4 23.4 0 0 0-2.54-.13c-2.52 0-4.25 1.54-4.25 4.37v2.4H7.25v3.3h2.83v8.45z" />
    </svg>
  )
}

const IG_HREF = 'https://www.instagram.com/a1.motor.park/'
const FB_HREF = 'https://www.facebook.com/A1.Motor.Park/'

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
    <>
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/70 border-b rule">
      <div className="relative w-full px-2 md:px-3 h-24 md:h-28 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="flex items-center hover:opacity-90 transition-opacity"
          aria-label="A1 Motor Park"
        >
          <Logo />
        </Link>

        {/* Desktop nav + social icons stacked, absolutely centered */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1.5">
          <nav className="flex items-center gap-1 text-[13px] font-mono tracking-mono uppercase">
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
          <div className="flex items-center gap-4">
            <a
              href={IG_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center w-7 h-7 text-ink/60 hover:text-ink transition-colors"
            >
              <InstagramIcon className="h-[16px] w-[16px]" />
            </a>
            <a
              href={FB_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center justify-center w-7 h-7 text-ink/60 hover:text-ink transition-colors"
            >
              <FacebookIcon className="h-[16px] w-[16px]" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <Link
            href={altHref}
            aria-label={`Switch to ${altLocale.toUpperCase()}`}
            className="inline-flex items-center gap-2 font-mono tracking-mono uppercase text-[14px] text-ink/60 hover:text-ink transition-colors px-1 py-1"
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
            className="lg:hidden inline-flex flex-col justify-center items-center gap-1.5 w-11 h-11 text-ink/80 hover:text-ink"
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
    </header>

    {/* Mobile nav overlay — rendered OUTSIDE <header> so its fixed positioning
        is relative to the viewport (header's backdrop-filter would otherwise
        create a containing block that clips this layer). */}
    <div
      id="mobile-nav"
      className={clsx(
        'lg:hidden fixed inset-x-0 bottom-0 top-24 z-30 transition-opacity duration-200',
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      )}
      style={{
        backgroundColor: 'rgba(5, 5, 5, 0.55)',
        backdropFilter: 'blur(28px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
      }}
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
        <div className="flex items-center justify-center gap-8 pt-8">
          <a
            href={IG_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center w-11 h-11 text-ink/80 hover:text-ink transition-colors"
          >
            <InstagramIcon className="h-[24px] w-[24px]" />
          </a>
          <a
            href={FB_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center w-11 h-11 text-ink/80 hover:text-ink transition-colors"
          >
            <FacebookIcon className="h-[24px] w-[24px]" />
          </a>
        </div>
      </nav>
    </div>
    </>
  )
}
