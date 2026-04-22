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
 * Header is `h-24 md:h-28`; this bar sits immediately below that with
 * a translucent backdrop so it reads against the dark page bg without
 * clobbering the headline content behind it.
 */
export function ScrollElevationBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const max =
        (document.documentElement.scrollHeight || document.body.scrollHeight) -
        window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      setProgress(Math.max(0, Math.min(1, p)))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const pct = Math.round(progress * 100)

  return (
    <div
      className="sticky top-24 md:top-28 z-30 -mt-px border-b rule bg-bg/75 backdrop-blur-md"
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
