'use client'

import { useMemo } from 'react'
import { elevation, trackMeta } from '@/lib/data/track'

type Props = {
  progress: number // 0..1
  className?: string
}

/**
 * Thin strip below the track rendering elevation as a line graph, with a
 * red vertical indicator at the current car position.
 */
export function ElevationStrip({ progress, className }: Props) {
  const W = 1000
  const H = 60
  const { path, minM, maxM } = useMemo(() => {
    const buckets: { d: number; y: number }[] = elevation.buckets
    const min = elevation.min
    const max = elevation.max
    const range = max - min || 1
    const d = buckets
      .map((b, i) => {
        const x = b.d * W
        const y = H - ((b.y - min) / range) * (H - 10) - 4
        return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
    return { path: d, minM: Math.round(min), maxM: Math.round(max) }
  }, [])

  const indicatorX = Math.max(0, Math.min(1, progress)) * W

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between mb-2">
        <p className="telemetry">ELEVATION · 585M BASE</p>
        <p className="telemetry">
          Δ{trackMeta.elevationRange.max - trackMeta.elevationRange.min}M
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-10 md:h-12 block"
        aria-label="Track elevation profile"
      >
        {/* baseline */}
        <line x1={0} y1={H - 4} x2={W} y2={H - 4} stroke="var(--muted)" strokeWidth="1" />
        {/* fill area */}
        <path
          d={`${path} L${W} ${H - 4} L0 ${H - 4} Z`}
          fill="var(--line)"
          fillOpacity="0.06"
        />
        {/* elevation curve */}
        <path
          d={path}
          stroke="var(--line)"
          strokeOpacity="0.55"
          strokeWidth="1.25"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {/* tick marks at 25/50/75% */}
        {[0.25, 0.5, 0.75].map(f => (
          <line
            key={f}
            x1={f * W}
            y1={H - 4}
            x2={f * W}
            y2={H - 10}
            stroke="var(--muted)"
            strokeWidth="1"
          />
        ))}
        {/* current position indicator */}
        <line
          x1={indicatorX}
          y1={0}
          x2={indicatorX}
          y2={H}
          stroke="var(--brand)"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={indicatorX} cy={H - 4} r={3} fill="var(--brand)" />
      </svg>
      <div className="flex justify-between mt-1 font-mono tracking-mono text-[10px] text-ink/40">
        <span>{minM}M</span>
        <span>{maxM}M</span>
      </div>
    </div>
  )
}
