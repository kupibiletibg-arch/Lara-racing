'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { trackPath, trackViewBox } from '@/lib/data/track'
import { Logo } from '@/components/brand/Logo'

/**
 * Full-viewport loading screen shown on initial mount. A red dot rides the
 * real A1 racing line on loop while the page assets settle. Fades out after
 * ~1.8s and unmounts entirely.
 *
 * Uses SVG's native <animateMotion> so the dot animation is GPU-backed and
 * runs even before React hydration finishes.
 */
export function LoadingScreen() {
  const t = useTranslations('common')
  const [stage, setStage] = useState<'on' | 'fade' | 'off'>('on')

  useEffect(() => {
    const t1 = window.setTimeout(() => setStage('fade'), 1800)
    const t2 = window.setTimeout(() => {
      setStage('off')
      // Signal the TrackHero to start its sequence now that we're out of the way.
      window.dispatchEvent(new CustomEvent('a1-ready'))
    }, 2300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (stage === 'off') return null

  const { x, y, w, h } = trackViewBox

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[200] bg-bg flex items-center justify-center transition-opacity duration-500 ${
        stage === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        <Logo />
        <svg
          viewBox={`${x} ${y} ${w} ${h}`}
          className="h-48 w-auto md:h-60"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="ls-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <path
            id="loader-line"
            d={trackPath}
            stroke="var(--line)"
            strokeOpacity="0.25"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle r={16} fill="var(--brand)" fillOpacity="0.35" filter="url(#ls-glow)">
            <animateMotion dur="2s" repeatCount="indefinite" rotate="auto">
              <mpath href="#loader-line" />
            </animateMotion>
          </circle>
          <circle r={5} fill="var(--brand)" stroke="var(--ink)" strokeWidth="1.5">
            <animateMotion dur="2s" repeatCount="indefinite" rotate="auto">
              <mpath href="#loader-line" />
            </animateMotion>
          </circle>
        </svg>
        <p className="font-mono tracking-mono uppercase text-[10px] text-ink/50">
          {t('loading')}
        </p>
      </div>
    </div>
  )
}
