'use client'

import { useLocale } from 'next-intl'
import { facilities } from '@/lib/data/facilities'
import { trackPath, pitPath, trackViewBox } from '@/lib/data/track'

/**
 * Landscape facility map. The track is drawn once with pit lane + white
 * terrain outline, and 14 numbered red POI circles sit on top at positions
 * taken from the reference image.
 */
export function FacilityMap() {
  const locale = useLocale()
  const { x, y, w, h } = trackViewBox

  // POI layer uses a 0..1000 × 0..800 viewBox so positions read as percentages.
  const POI_W = 1000
  const POI_H = 800

  return (
    <div className="relative aspect-[5/3] md:aspect-[16/10] w-full overflow-hidden border rule bg-bg">
      {/* track underlay */}
      <svg
        viewBox={`${x} ${y} ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        fill="none"
        aria-hidden
        style={{ transform: 'rotate(90deg) scale(1.15)' }}
      >
        <path
          d={trackPath}
          stroke="var(--line)"
          strokeOpacity="0.15"
          strokeWidth="22"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={pitPath}
          stroke="var(--line)"
          strokeOpacity="0.3"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={trackPath}
          stroke="var(--brand)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* POI overlay */}
      <svg
        viewBox={`0 0 ${POI_W} ${POI_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        {facilities.map(f => {
          const cx = f.x * POI_W
          const cy = f.y * POI_H
          const label = locale === 'bg' ? f.labelBg : f.labelEn
          return (
            <g key={f.id} className="group cursor-help">
              <circle
                cx={cx}
                cy={cy}
                r={18}
                fill="var(--brand)"
                stroke="var(--ink)"
                strokeWidth="1.5"
                className="transition-transform"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <circle
                cx={cx}
                cy={cy}
                r={28}
                fill="var(--brand)"
                fillOpacity="0"
                className="group-hover:fill-opacity-20 transition-[fill-opacity]"
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--ink)"
                fontFamily="var(--font-mono), monospace"
                fontWeight={700}
                fontSize={13}
              >
                {f.id}
              </text>
              <title>{label}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
