'use client'

/**
 * <CookieBanner /> — first-visit consent dialog.
 *
 * Shows a fixed banner at the bottom of the viewport until the user
 * explicitly chooses "Приемам всички" or "Само наложителните". The
 * choice is persisted to localStorage under `STORAGE_KEY` so the
 * banner only appears once. Subsequent visits skip the render
 * entirely (component returns null after the mount-time check).
 *
 * Choice values:
 *   "all"        → user accepted every category
 *   "essential"  → user accepted only strictly-necessary cookies
 *
 * Future analytics / marketing scripts should gate themselves on
 * `localStorage.getItem('a1-cookie-consent') === 'all'` before they
 * fire.
 */

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'a1-cookie-consent'

export function CookieBanner() {
  const t = useTranslations('cookies')
  const [visible, setVisible] = useState(false)

  // Read the persisted choice AFTER mount so the SSR-rendered HTML
  // and the first client render match (they always render `null`
  // during hydration). Then we flip `visible` on if no choice yet.
  useEffect(() => {
    try {
      const choice = localStorage.getItem(STORAGE_KEY)
      if (!choice) setVisible(true)
    } catch {
      // localStorage may be unavailable (private mode, sandboxed
      // iframe). Default to showing the banner so the user always
      // gets a chance to make a decision.
      setVisible(true)
    }
  }, [])

  const decide = (value: 'all' | 'essential') => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Persistence is best-effort; even if it fails we still hide
      // the banner for this session so it's not a nag.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('title')}
      className="fixed bottom-0 left-0 right-0 z-50 px-3 md:px-5 pb-3 md:pb-5 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-[1100px] border rule bg-bg/95 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.45)] p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <p className="telemetry mb-2">{t('kicker')}</p>
          <p className="font-display font-medium text-[16px] md:text-[18px] leading-tight tracking-tight mb-2">
            {t('title')}
          </p>
          <p className="text-ink/75 text-[13px] md:text-[14px] leading-snug">
            {t('body')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 md:flex-shrink-0">
          <button
            type="button"
            onClick={() => decide('essential')}
            className="font-mono tracking-mono uppercase text-[11px] px-4 py-3 border rule text-ink/80 hover:text-ink hover:bg-ink/5 transition-colors whitespace-nowrap"
          >
            {t('essential')}
          </button>
          <button
            type="button"
            onClick={() => decide('all')}
            className="font-mono tracking-mono uppercase text-[11px] px-4 py-3 bg-brand text-ink hover:bg-brand-deep transition-colors whitespace-nowrap"
          >
            {t('acceptAll')}
          </button>
        </div>
      </div>
    </div>
  )
}
