'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { trackMeta } from '@/lib/data/track'
import { ElevationStrip } from './ElevationStrip'

/**
 * Home-page hero with the "A1 RACING TRACK" 3D visualiser on the left and
 * static title/subtitle/intro + CTAs on the right. The visualiser is a
 * standalone Three.js bundle shipped as /public/a1-track/index.html (matcap
 * at /public/vendor/matcap_red.png), so we embed it via an iframe — no Three
 * or GSAP is needed on the React side.
 */
export function TrackHero() {
  const t = useTranslations('hero')
  const locale = useLocale()

  return (
    <section className="relative" aria-label="A1 Motor Park hero">
      <div className="md:sticky md:top-24 md:h-[calc(100vh-7rem)]">
        <div className="mx-auto max-w-[1400px] w-full md:h-full px-5 md:px-8 pb-6 md:pb-10 pt-5 md:pt-8 flex flex-col md:grid md:grid-cols-[1fr_360px] gap-8 md:gap-10 md:items-stretch">
          {/* LEFT — 3D stage */}
          <div className="relative flex flex-col min-h-[56vh] md:min-h-0">
            <div className="flex items-baseline justify-between gap-4 mb-3 md:mb-4">
              <p className="telemetry">{t('kicker')}</p>
              <p className="telemetry hidden md:block">
                {trackMeta.lengthM}M · FIA G3 · SAMOKOV
              </p>
            </div>

            <div className="relative flex-1 min-h-0 overflow-hidden">
              <Crosshair className="top-0 left-0" />
              <Crosshair className="top-0 right-0 rotate-90" />
              <Crosshair className="bottom-0 left-0 -rotate-90" />
              <Crosshair className="bottom-0 right-0 rotate-180" />

              <iframe
                src="/a1-track/index.html"
                title="A1 Motor Park — 3D circuit"
                loading="eager"
                scrolling="no"
                allow="fullscreen"
                className="absolute inset-0 w-full h-full border-0 bg-transparent"
              />
            </div>

            <ElevationStrip progress={0} className="mt-3 md:mt-4" />
          </div>

          {/* RIGHT — hero copy */}
          <aside className="relative flex flex-col justify-between min-h-0">
            <div>
              <h1 className="font-display font-bold text-[44px] md:text-[56px] lg:text-[64px] leading-[0.95] tracking-tight">
                {t('title')}
              </h1>
              <p className="mt-2 font-mono tracking-mono uppercase text-[11px] text-ink/60">
                {t('subtitle')}
              </p>
              <p className="mt-5 md:mt-6 text-ink/75 text-[14px] md:text-[15px] leading-relaxed max-w-sm">
                {t('intro')}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2">
              <Link
                href={`/${locale}/calendar`}
                className="text-center font-mono tracking-mono uppercase text-[11px] px-4 py-3 bg-brand text-ink hover:bg-brand-deep transition-colors"
              >
                {t('ctaCalendar')}
              </Link>
              <Link
                href={`/${locale}/track`}
                className="text-center font-mono tracking-mono uppercase text-[11px] px-4 py-3 border rule text-ink hover:bg-ink/5 transition-colors"
              >
                {t('ctaTrack')}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Crosshair({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute ${className} pointer-events-none z-[1]`}
      style={{ width: 18, height: 18 }}
    >
      <span className="absolute left-0 top-0 w-[18px] h-px bg-ink/20" />
      <span className="absolute left-0 top-0 w-px h-[18px] bg-ink/20" />
    </span>
  )
}
