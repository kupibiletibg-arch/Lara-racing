'use client'

type Props = {
  id: string
  x: number
  y: number
  trackPosition: number
  href: string
}

/**
 * SVG-native race pin: a red circle with the event number in white.
 * Uses `data-active` so the orchestrator can highlight the nearest pin
 * imperatively without re-rendering.
 */
export function RacePin({ id, x, y, trackPosition, href }: Props) {
  return (
    <a
      href={href}
      aria-label={`Race ${id}`}
      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
    >
      <g
        data-pin
        data-track-pos={trackPosition}
        data-active="0"
        transform={`translate(${x} ${y})`}
        className="group transition-transform"
        style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
      >
        {/* halo (only visible when active via CSS) */}
        <circle
          r={14}
          fill="var(--brand)"
          fillOpacity="0.25"
          className="opacity-0 group-data-[active=1]:opacity-100 transition-opacity"
        />
        <circle
          r={9}
          fill="var(--brand)"
          stroke="var(--ink)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--ink)"
          fontFamily="var(--font-mono), monospace"
          fontWeight={700}
          fontSize={9}
          style={{ letterSpacing: '0.02em' }}
        >
          {id}
        </text>
      </g>
    </a>
  )
}
