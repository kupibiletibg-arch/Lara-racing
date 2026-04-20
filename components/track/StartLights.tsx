'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

type Phase = 'dark' | 'lighting' | 'hold' | 'go' | 'done'

type Props = {
  /** Called the instant lights go out (racing starts). */
  onGo: () => void
  /** Skip the animation and resolve immediately (e.g. reduced motion). */
  skip?: boolean
  className?: string
}

/**
 * F1-style start lights: 5 red lights illuminate one-by-one (900ms apart),
 * hold for a brief random window, then all go out together — that's the
 * signal to start the race (draw animation, in our case).
 *
 * Rendered as 5 SVG circles with glow filter. Sits above the track.
 */
export function StartLights({ onGo, skip, className }: Props) {
  const [phase, setPhase] = useState<Phase>('dark')
  const [lit, setLit] = useState(0)

  useEffect(() => {
    if (skip) {
      setPhase('done')
      onGo()
      return
    }
    let cancelled = false
    const timers: number[] = []

    // Brief leading pause.
    const lead = 150
    const spacing = 260
    timers.push(
      window.setTimeout(() => {
        if (cancelled) return
        setPhase('lighting')
      }, lead),
    )

    // Illuminate 1..5 with 260ms spacing (≈1.3s total).
    for (let i = 1; i <= 5; i++) {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          setLit(i)
        }, lead + i * spacing),
      )
    }

    // Hold random 400–750ms (F1-like unpredictability), then lights out.
    const hold = 400 + Math.random() * 350
    timers.push(
      window.setTimeout(() => {
        if (cancelled) return
        setPhase('hold')
      }, lead + 5 * spacing),
    )
    timers.push(
      window.setTimeout(() => {
        if (cancelled) return
        setPhase('go')
        setLit(0)
        onGo()
        window.setTimeout(() => !cancelled && setPhase('done'), 500)
      }, lead + 5 * spacing + hold),
    )

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [skip, onGo])

  if (phase === 'done') return null

  return (
    <div
      className={clsx(
        'pointer-events-none transition-opacity duration-500',
        phase === 'go' ? 'opacity-0' : 'opacity-100',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 200 54" className="w-[180px] md:w-[220px] h-auto" fill="none">
        {/* gantry bar */}
        <rect x="6" y="20" width="188" height="14" rx="2" fill="#141414" stroke="#2a2a2a" strokeWidth="1" />
        {/* lights */}
        {[0, 1, 2, 3, 4].map(i => {
          const on = i < lit
          const cx = 22 + i * 39
          return (
            <g key={i}>
              {on && (
                <circle cx={cx} cy={27} r={10} fill="#FF1B1B" opacity={0.35} filter="blur(4px)" />
              )}
              <circle
                cx={cx}
                cy={27}
                r={6.5}
                fill={on ? '#FF2020' : '#2a1010'}
                stroke={on ? '#FF6A6A' : '#1a0808'}
                strokeWidth="1"
              />
              {on && <circle cx={cx - 1.5} cy={25} r={1.5} fill="#ffffff" opacity="0.7" />}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
