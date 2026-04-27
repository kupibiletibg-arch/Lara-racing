import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/brand/Logo'
import { PartnersMarquee } from '@/components/partners/PartnersMarquee'

const IG_HREF = 'https://www.instagram.com/a1.motor.park/'
const FB_HREF = 'https://www.facebook.com/A1.Motor.Park/'

function InstagramIcon({ className = 'h-[20px] w-[20px]' }: { className?: string }) {
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

function FacebookIcon({ className = 'h-[20px] w-[20px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 21.95V13.5h2.83l.42-3.3h-3.25V8.1c0-.95.27-1.6 1.63-1.6h1.74V3.57a23.4 23.4 0 0 0-2.54-.13c-2.52 0-4.25 1.54-4.25 4.37v2.4H7.25v3.3h2.83v8.45z" />
    </svg>
  )
}

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="relative mt-32 border-t rule">
      <div className="pt-8 md:pt-12">
        <PartnersMarquee />
      </div>

      {/* Three-column row: A1 logo on the left, kupibileti.bg on the
          right, and the centred tagline + social icons absolutely
          positioned in the middle so they stay perfectly centred to
          the viewport regardless of how wide the side columns get. */}
      <div className="relative w-full px-3 md:px-4 pt-12 md:pt-16 pb-4 md:pb-6 flex items-end justify-between gap-6">
        <div className="flex items-end">
          <Logo className="!h-10 md:!h-28" />
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bottom-4 md:bottom-6 flex-col items-center gap-4 max-w-md text-center">
          <p className="text-ink/80 font-display text-lg leading-snug">
            {t('tagline')}
          </p>
          <p className="font-mono tracking-mono uppercase text-[11px] text-ink/50">
            Samokov · Bulgaria · 42°19′N 23°34′E · 585 m
          </p>
          <div className="flex items-center justify-center gap-5">
            <a
              href={IG_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center w-10 h-10 text-ink/60 hover:text-ink transition-colors"
            >
              <InstagramIcon className="h-[20px] w-[20px]" />
            </a>
            <a
              href={FB_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center justify-center w-10 h-10 text-ink/60 hover:text-ink transition-colors"
            >
              <FacebookIcon className="h-[20px] w-[20px]" />
            </a>
          </div>
        </div>

        <a
          href="https://www.kupibileti.bg/bg/about-event/2292"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="kupibileti.bg"
          className="flex flex-col items-end gap-2 md:gap-3 hover:opacity-90 transition-opacity"
        >
          <span className="font-mono tracking-mono uppercase text-[10px] md:text-[11px] text-ink/60">
            {t('ticketing')}
          </span>
          <Image
            src="/partners/kupibileti.svg"
            alt="kupibileti.bg"
            width={1007}
            height={307}
            // Bumped up so the kupibileti mark visually balances the
            // A1 logo on the opposite side of the footer row.
            className="h-12 md:h-20 w-auto"
          />
        </a>
      </div>

      {/* Mobile-only centred tagline + socials. The desktop layout
          uses absolute centring so the social icons can sit under
          the tagline without breaking the side columns; on mobile we
          stack the same content as a normal centred block beneath the
          A1 / kupibileti row. */}
      <div className="md:hidden flex flex-col items-center gap-4 px-5 pb-6 text-center">
        <p className="text-ink/80 font-display text-base leading-snug max-w-xs">
          {t('tagline')}
        </p>
        <p className="font-mono tracking-mono uppercase text-[10px] text-ink/50">
          Samokov · Bulgaria · 42°19′N 23°34′E · 585 m
        </p>
        <div className="flex items-center justify-center gap-6">
          <a
            href={IG_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center justify-center w-11 h-11 text-ink/70 hover:text-ink transition-colors"
          >
            <InstagramIcon className="h-[22px] w-[22px]" />
          </a>
          <a
            href={FB_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="inline-flex items-center justify-center w-11 h-11 text-ink/70 hover:text-ink transition-colors"
          >
            <FacebookIcon className="h-[22px] w-[22px]" />
          </a>
        </div>
      </div>

      <div className="border-t rule">
        <div className="w-full px-3 md:px-4 py-4 font-mono tracking-mono uppercase text-[10px] text-ink/40">
          {t('copyright')}
        </div>
      </div>
    </footer>
  )
}
