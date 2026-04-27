'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Logo } from '@/components/brand/Logo'
import { locales } from '@/lib/i18n/config'
import clsx from 'clsx'

function CartIcon({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
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
      <path d="M3 4h2l2.4 11.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.5L21 7H6" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  )
}

function ChevronDown({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

type NavLink = {
  href: string
  label: string
  exact?: boolean
  children?: NavLink[]
}

export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  // Which nav parent is currently expanded inside the mobile overlay.
  // Drives the collapsible drop-down that replaces the old always-
  // visible indented children list.
  const [expandedHref, setExpandedHref] = useState<string | null>(null)

  const altLocale = locales.find(l => l !== locale) ?? 'en'
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/'
  const altHref = `/${altLocale}${pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale}`

  // Top-level nav tree. When a link carries `children` it renders as a
  // desktop hover dropdown and as indented sub-rows inside the mobile
  // overlay. No new drawer UX on mobile — children are just shown
  // beneath their parent with a hair smaller type + left indent, which
  // keeps the menu scannable without adding a tap target to expand.
  const links: NavLink[] = [
    { href: `/${locale}`, label: t('home'), exact: true },
    // Track days promoted to its own top-level item, sitting just to
    // the left of Календар per the latest brief.
    { href: `/${locale}/calendar/track-days`, label: t('trackDays') },
    { href: `/${locale}/calendar`, label: t('calendar') },
    { href: `/${locale}/track`, label: t('track') },
    { href: `/${locale}/facilities`, label: t('facilities') },
    {
      href: `/${locale}/experiences`,
      label: t('experiences'),
      children: [
        { href: `/${locale}/experiences/hot-laps`, label: t('experiencesHotLaps') },
        { href: `/${locale}/experiences/academy`, label: t('experiencesAcademy') },
        { href: `/${locale}/experiences/vr-racing`, label: t('experiencesVrRacing') },
      ],
    },
    { href: `/${locale}/partners`, label: t('partners') },
    // /about route file still exists but is no longer surfaced in
    // navigation per the latest brief — accessible only via direct
    // URL until we decide whether to delete the route entirely.
    { href: `/${locale}/contact`, label: t('contact') },
    { href: `/${locale}/shop`, label: t('shop') },
  ]

  // Cart button points at the shop stub for now. When the shop ships
  // we'll swap this to `/shop/cart` (or wire it to a slide-over).
  const cartHref = `/${locale}/shop`

  const isActive = (l: NavLink) =>
    l.exact
      ? pathname === l.href
      : pathname === l.href || pathname.startsWith(`${l.href}/`)

  // Close on route change + lock page scroll while open + ESC to close.
  // Collapse any expanded sub-section with the close so the menu
  // re-opens fresh (not stuck halfway through a previous expansion).
  useEffect(() => {
    setMenuOpen(false)
    setExpandedHref(null)
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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(5,5,5,0.88)] supports-[backdrop-filter]:bg-[rgba(5,5,5,0.72)] border-b rule shadow-[0_1px_0_0_rgba(242,237,228,0.04)]">
      <div className="relative w-full px-2 md:px-3 h-20 md:h-28 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="flex items-center hover:opacity-90 transition-opacity"
          aria-label="A1 Motor Park"
        >
          <Logo />
        </Link>

        <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1 text-[13px] font-mono tracking-mono uppercase">
          {links.slice(1).map(l => {
            const active = isActive(l)

            if (l.children) {
              return (
                <div key={l.href} className="relative group">
                  <Link
                    href={l.href}
                    className={clsx(
                      'px-3 py-2 transition-colors relative inline-flex items-center gap-1.5',
                      active ? 'text-brand' : 'text-ink/70 hover:text-ink',
                    )}
                    aria-haspopup="true"
                  >
                    {l.label}
                    <ChevronDown className="h-3 w-3 opacity-70 transition-transform group-hover:rotate-180" />
                    {active && (
                      <span className="absolute left-3 right-3 bottom-1 h-px bg-brand" />
                    )}
                  </Link>

                  {/* Dropdown panel. `pt-2` on the wrapper bridges the
                      gap below the parent label so mouse hover doesn't
                      drop as the cursor moves from parent to items. */}
                  <div
                    className="absolute left-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto transition-opacity duration-150"
                    role="menu"
                  >
                    <div className="min-w-[200px] bg-bg/95 backdrop-blur-md border rule py-2 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                      {l.children.map(c => {
                        const cActive = isActive(c)
                        return (
                          <Link
                            key={c.href}
                            href={c.href}
                            role="menuitem"
                            className={clsx(
                              'block px-4 py-2 transition-colors',
                              cActive
                                ? 'text-brand'
                                : 'text-ink/75 hover:text-ink hover:bg-ink/5',
                            )}
                          >
                            {c.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            }

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

        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Cart — visible at every breakpoint; links to the shop
              stub for now. When cart state ships this is where the
              item-count badge will live. */}
          <Link
            href={cartHref}
            aria-label={t('cart')}
            className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 text-ink/70 hover:text-ink transition-colors"
          >
            <CartIcon className="h-[20px] w-[20px] md:h-[22px] md:w-[22px]" />
          </Link>

          <Link
            href={altHref}
            prefetch={false}
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
        'lg:hidden fixed inset-x-0 bottom-0 top-20 z-30 transition-opacity duration-200 overflow-y-auto',
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
          const active = isActive(l)
          const hasChildren = Boolean(l.children?.length)
          const expanded = expandedHref === l.href

          // Parent row: the label itself is still a Link that goes to
          // the parent's landing page; the trailing chevron is a
          // separate toggle that expands/collapses the children
          // without navigating. That way the landing page stays one
          // tap away, and the sub-items are one tap behind the
          // chevron — no double-duty on the same target.
          return (
            <Fragment key={l.href}>
              <div className="flex items-stretch border-b rule">
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    'flex-1 font-display font-medium text-[22px] py-3 px-1 transition-colors',
                    active ? 'text-brand' : 'text-ink/85 hover:text-ink',
                  )}
                >
                  {l.label}
                </Link>
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedHref(expanded ? null : l.href)
                    }
                    aria-expanded={expanded}
                    aria-controls={`mobile-sub-${l.href}`}
                    aria-label={`${expanded ? 'Collapse' : 'Expand'} ${l.label}`}
                    className="px-3 inline-flex items-center justify-center text-ink/55 hover:text-ink transition-colors"
                  >
                    <ChevronDown
                      className={clsx(
                        'h-4 w-4 transition-transform duration-200',
                        expanded && 'rotate-180',
                      )}
                    />
                  </button>
                )}
              </div>

              {hasChildren && (
                <div
                  id={`mobile-sub-${l.href}`}
                  className={clsx(
                    // Grid-rows trick for a smooth open/close animation
                    // on content with unknown intrinsic height. The
                    // inner wrapper needs `overflow-hidden` + min-h-0
                    // for the 0fr/1fr interpolation to clip correctly.
                    'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
                    expanded
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none',
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    {l.children?.map(c => {
                      const cActive = isActive(c)
                      return (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={() => setMenuOpen(false)}
                          className={clsx(
                            'block font-display font-medium text-[18px] py-2.5 pl-6 pr-1 border-b rule transition-colors',
                            cActive
                              ? 'text-brand'
                              : 'text-ink/70 hover:text-ink',
                          )}
                        >
                          · {c.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </Fragment>
          )
        })}
      </nav>
    </div>
    </>
  )
}
