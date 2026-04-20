'use client'

import { forwardRef } from 'react'
import { trackPath, pitPath, trackViewBox } from '@/lib/data/track'

type Props = {
  className?: string
  showPitLane?: boolean
  showTerrain?: boolean
}

/**
 * Presentational SVG. The orchestrator (TrackHero) composes this with
 * framer-motion and owns animation state.
 *
 * Note the forwardRef points at the <path id="racing-line"> element so the
 * orchestrator can call getPointAtLength / getTotalLength on it.
 */
export const TrackSVG = forwardRef<SVGPathElement, Props>(function TrackSVG(
  { className, showPitLane = true, showTerrain = true },
  ref,
) {
  const { x, y, w, h } = trackViewBox
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      fill="none"
      aria-label="A1 Motor Park — racing line"
    >
      {/* subtle terrain ring — ghost echo around the track */}
      {showTerrain && (
        <>
          <path
            d={trackPath}
            stroke="var(--line)"
            strokeOpacity="0.08"
            strokeWidth="22"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={trackPath}
            stroke="var(--line)"
            strokeOpacity="0.15"
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
      {showPitLane && (
        <path
          d={pitPath}
          stroke="var(--line)"
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <path
        ref={ref}
        id="racing-line"
        d={trackPath}
        stroke="var(--brand)"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
})
