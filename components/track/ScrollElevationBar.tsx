'use client'

import { useEffect, useState } from 'react'
import { ElevationStrip } from './ElevationStrip'

/**
 * Sticky elevation strip pinned just below the site header. The red
 * position indicator on the strip is driven by the viewer's scroll
 * progress through the home page — 0 % at the very top, 100 % at the
 * bottom — so the elevation profile doubles as a subtle page-scroll
 * progress bar without the standard chrome.
 *
 * Scroll handler is rAF-throttled and skips state updates below a 0.5 %
 * delta, so fast scroll doesn't thrash React and the ~400-node
 * elevation strip doesn't re-render 60× a second.
 */
export function ScrollElevationBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    let lastEmitted = -1
    const compute = () => {
      const max =
        (document.documentElement.scrollHeight || document.body.scrollHeight) -
        window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      const clamped = Math.max(0, Math.min(1, p))
      // Only re-render when progress moves by at least 0.5 %.
      if (Math.abs(clamped - lastEmitted) >= 0.005 || lastEmitted < 0) {
        lastEmitted = clamped
        setProgress(clamped)
      }
      raf = 0
    }
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  const pct = Math.round(progress * 100)

  return (
    <div
      // Stack order:
      //   z-40  header
      //   z-30  mobile nav overlay
      //   z-20  this bar  ← sits under the overlay so the hamburger
      //                    drop-down covers it on phones
      //   z-0   page content
      // top-20 aligns with the new mobile header height (h-20);
      // md:top-28 aligns with the desktop header (h-28).
      className="sticky top-20 md:top-28 z-20 -mt-px border-b rule bg-bg/75 backdrop-blur-md"
      aria-hidden
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-2 md:py-3">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <ElevationStrip progress={progress} />
          </div>
          <div className="shrink-0 font-mono tracking-mono text-[11px] md:text-[12px] text-ink/80 tabular-nums">
            {pct.toString().padStart(2, '0')}%
          </div>
        </div>
      </div>
    </div>
  )
}
