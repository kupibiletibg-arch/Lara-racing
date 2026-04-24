'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Kicks off prefetches for every top-level route as soon as the intro
 * overlay dismisses (or immediately, if there's no intro on this load).
 *
 * The <Link> elements in the header already trigger prefetches on hover,
 * but that's too lazy for nav links that were *below the fold of the
 * mobile layout* — the user clicked them before the hover fired. Calling
 * router.prefetch() explicitly on app init primes the route cache so the
 * actual click is a cache hit and the subsequent route-change preloader
 * has nothing to wait on.
 *
 * We wait for `a1-ready` (dispatched by IntroSequence when the first-run
 * overlay dismisses) so the prefetch RSC fetches don't compete for
 * bandwidth with the hero video or the 3D iframe. If the intro is skipped
 * (?skipIntro=1 or reduced-motion fast path), an idle-timeout fallback
 * ensures we still prefetch within ~2 s.
 */
const ROUTES = [
  '/calendar',
  '/track',
  '/facilities',
  '/partners',
  '/about',
  '/contact',
] as const

export function RoutePrefetcher({ locale }: { locale: string }) {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    let started = false
    const prefetchAll = () => {
      if (started) return
      started = true
      for (const route of ROUTES) {
        try {
          router.prefetch(`/${locale}${route}`)
        } catch {}
      }
    }

    if ((window as unknown as { __a1Ready?: boolean }).__a1Ready) {
      prefetchAll()
      return
    }

    window.addEventListener('a1-ready', prefetchAll, { once: true })
    // Prefer requestIdleCallback where available; fall back to setTimeout
    // behind a feature probe that TS's `in` narrowing can't collapse to
    // never.
    type RIC = (cb: () => void, opts?: { timeout: number }) => number
    type CIC = (id: number) => void
    const ric = (window as unknown as { requestIdleCallback?: RIC })
      .requestIdleCallback
    const cic = (window as unknown as { cancelIdleCallback?: CIC })
      .cancelIdleCallback
    const idleId: number = ric
      ? ric(prefetchAll, { timeout: 2000 })
      : (window.setTimeout(prefetchAll, 1200) as unknown as number)

    return () => {
      window.removeEventListener('a1-ready', prefetchAll)
      if (cic) {
        try {
          cic(idleId)
        } catch {}
      } else {
        window.clearTimeout(idleId)
      }
    }
  }, [locale, router])

  return null
}
