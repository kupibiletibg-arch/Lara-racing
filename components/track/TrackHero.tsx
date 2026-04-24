'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { trackMeta } from '@/lib/data/track'

/**
 * Home-page hero with the "A1 RACING TRACK" 3D visualiser on the left and
 * static title/subtitle/intro + CTAs on the right. The visualiser is a
 * standalone Three.js bundle shipped as /public/a1-track/index.html (matcap
 * at /public/vendor/matcap_red.png), so we embed it via an iframe — no Three
 * or GSAP is needed on the React side.
 *
 * The iframe only mounts after the intro overlay dismisses (signalled via a
 * window `a1-ready` event) or after a short idle fallback — this keeps the
 * main thread free during the preloader moment and avoids competing for
 * network bandwidth with the intro video.
 */
export function TrackHero() {
  const t = useTranslations('hero')
  const locale = useLocale()
  const [mountIframe, setMountIframe] = useState(false)

  useEffect(() => {
    // Already signalled (e.g. user navigated back to home after intro)?
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { __a1Ready?: boolean }).__a1Ready
    ) {
      setMountIframe(true)
      return
    }
    const onReady = () => setMountIframe(true)
    window.addEventListener('a1-ready', onReady, { once: true })
    // Fallback: if no intro was shown (?skipIntro=1 or sessionStorage
    // flag already set), idle-mount the iframe so the hero still works.
    type RIC = (cb: () => void, opts?: { timeout: number }) => number
    type CIC = (id: number) => void
    const ric = (window as unknown as { requestIdleCallback?: RIC })
      .requestIdleCallback
    const cic = (window as unknown as { cancelIdleCallback?: CIC })
      .cancelIdleCallback
    const idleId: number = ric
      ? ric(() => setMountIframe(true), { timeout: 2500 })
      : (window.setTimeout(() => setMountIframe(true), 1500) as unknown as number)
    return () => {
      window.removeEventListener('a1-ready', onReady)
      if (cic) {
        try {
          cic(idleId)
        } catch {}
      } else {
        window.clearTimeout(idleId)
      }
    }
  }, [])

  return (
    <section className="relative" aria-label="A1 Motor Park hero">
      <div className="md:sticky md:top-24 md:h-[calc(100vh-7rem)]">
        <div className="mx-auto max-w-[1400px] w-full md:h-full px-5 md:px-8 pb-6 md:pb-10 pt-5 md:pt-8 flex flex-col md:grid md:grid-cols-[1fr_280px] gap-8 md:gap-6 lg:gap-8 md:items-stretch">
          {/* LEFT — 3D stage */}
          <div className="relative flex flex-col min-h-[62vh] md:min-h-0">
            <div className="flex items-baseline justify-between gap-4 mb-3 md:mb-4">
              <p className="telemetry">{t('kicker')}</p>
              <p className="telemetry hidden md:block">
                {trackMeta.lengthM}M · FIA G3 · SAMOKOV
              </p>
            </div>

            {/* Stage wrapper. The viz's stage element uses `touch-action:
             * pan-y` so vertical swipes still scroll the page while
             * horizontal drags are captured inside the viz for the
             * manual 360° rotation. Pinch-zoom is disabled via the viz's
             * own <meta viewport> (user-scalable=no).
             */}
            <div className="relative flex-1 min-h-0 overflow-hidden select-none">
              <Crosshair className="top-0 left-0" />
              <Crosshair className="top-0 right-0 rotate-90" />
              <Crosshair className="bottom-0 left-0 -rotate-90" />
              <Crosshair className="bottom-0 right-0 rotate-180" />

              {mountIframe ? (
                <iframe
                  src="/a1-track/index.html"
                  title="A1 Motor Park — 3D circuit"
                  loading="lazy"
                  scrolling="no"
                  allow="fullscreen"
                  className="absolute inset-0 w-full h-full border-0 bg-transparent animate-[fadeIn_600ms_ease-out]"
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="h-14 w-14 rounded-full border border-ink/10 border-t-brand animate-spin" />
                </div>
              )}
            </div>
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
