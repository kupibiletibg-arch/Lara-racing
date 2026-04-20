'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { ElevationStrip } from './ElevationStrip'
import { RacePin } from './RacePin'
import { races } from '@/lib/data/races'
import { trackPath, pitPath, trackViewBox, trackMeta } from '@/lib/data/track'
import { pointAt } from '@/lib/track/usePathPoint'

type Phase = 'loading' | 'lights' | 'drawing' | 'qualifying' | 'scroll'

const DEFAULT_TILT_X = 60
const DEFAULT_TILT_Y = -12
const DEFAULT_TILT_Z = 0
const INITIAL_TILT_X = 5   // almost flat — entry rotation tweens to DEFAULT_TILT_X
const INITIAL_TILT_Y = 0
const QUALI_DURATION = 8000

// Flat stacked depth — one single continuous racing line, replicated across 9
// layers at different Z for thickness, progressively darker and slightly wider
// towards the base. The bottom-most layer is a broad gray halo that reads as a
// continuous grounded "border beneath the line" when the stage is tilted.
const DEPTH_LAYERS: Array<{ z: number; color: string; opacity: number; width: number }> = [
  { z: -18, color: '#3a3a38', opacity: 0.55, width: 30 }, // wide gray base
  { z: -14, color: '#1a0609', opacity: 0.85, width: 12 },
  { z: -11, color: '#2a0a10', opacity: 0.9,  width: 7.5 },
  { z: -9,  color: '#3c0e16', opacity: 0.92, width: 5.5 },
  { z: -7,  color: '#54121c', opacity: 0.94, width: 5 },
  { z: -5,  color: '#721626', opacity: 0.95, width: 4.6 },
  { z: -3,  color: '#951832', opacity: 0.96, width: 4.3 },
  { z: -1,  color: '#B41B3A', opacity: 0.98, width: 4 },
  { z: 0,   color: 'var(--brand)', opacity: 1, width: 4 }, // top surface
]

export function TrackHero() {
  const t = useTranslations('hero')
  const tc = useTranslations('calendar')
  const te = useTranslations('events')
  const teT = useTranslations('eventType')
  const locale = useLocale()

  const prefersReduced = useReducedMotion()
  const pathRef = useRef<SVGPathElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const pulseRef = useRef<SVGCircleElement>(null)
  const pinLayerRef = useRef<SVGSVGElement>(null)

  const [totalLength, setTotalLength] = useState(0)
  const [phase, setPhase] = useState<Phase>('loading')
  const [drawProgress, setDrawProgress] = useState(0)
  const [qualiProgress, setQualiProgress] = useState(0)
  const [carProgress, setCarProgress] = useState(0)

  // Wait until the LoadingScreen has faded out (≈2.3s) before starting the
  // start-lights sequence. Listens for a custom event dispatched by the loader.
  useEffect(() => {
    const onReady = () => setPhase(p => (p === 'loading' ? 'drawing' : p))
    window.addEventListener('a1-ready', onReady)
    // Fallback — if loader never fires (reduced motion, etc.), start after 2.4s.
    const fallback = window.setTimeout(onReady, 2400)
    return () => {
      window.removeEventListener('a1-ready', onReady)
      clearTimeout(fallback)
    }
  }, [])

  const [tilt, setTilt] = useState({ x: INITIAL_TILT_X, y: INITIAL_TILT_Y, z: DEFAULT_TILT_Z })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ px: number; py: number; tx: number; ty: number } | null>(null)
  const entryDone = useRef(false)
  const draggedDuringEntry = useRef(false)

  useEffect(() => {
    if (!pathRef.current) return
    setTotalLength(pathRef.current.getTotalLength())
  }, [])

  useEffect(() => {
    if (phase !== 'drawing' || !totalLength) return
    if (prefersReduced) {
      setDrawProgress(1)
      setPhase('scroll')
      return
    }
    // setTimeout (not rAF) so hidden/backgrounded tabs still tick smoothly.
    const start = performance.now()
    const dur = 1800
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const t = Math.min(1, (performance.now() - start) / dur)
      setDrawProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) setTimeout(tick, 16)
      else setPhase('qualifying')
    }
    tick()
    return () => { cancelled = true }
  }, [phase, totalLength, prefersReduced])

  // Entry rotation: when drawing begins, tween the tilt from near-flat up to
  // the default isometric pose over the same 1.8 s as the draw. Fires once.
  useEffect(() => {
    if (phase !== 'drawing' || entryDone.current) return
    entryDone.current = true
    if (prefersReduced) {
      setTilt({ x: DEFAULT_TILT_X, y: DEFAULT_TILT_Y, z: DEFAULT_TILT_Z })
      return
    }
    const start = performance.now()
    const dur = 1800
    const fromX = INITIAL_TILT_X
    const fromY = INITIAL_TILT_Y
    const toX = DEFAULT_TILT_X
    const toY = DEFAULT_TILT_Y
    let cancelled = false
    const tick = () => {
      if (cancelled || draggedDuringEntry.current) return
      const t = Math.min(1, (performance.now() - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setTilt({
        x: fromX + (toX - fromX) * eased,
        y: fromY + (toY - fromY) * eased,
        z: DEFAULT_TILT_Z,
      })
      if (t < 1) setTimeout(tick, 16)
    }
    tick()
    return () => { cancelled = true }
  }, [phase, prefersReduced])

  useEffect(() => {
    if (phase !== 'qualifying') return
    const start = performance.now()
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const t = Math.min(1, (performance.now() - start) / QUALI_DURATION)
      setQualiProgress(0.5 - Math.cos(Math.PI * t) / 2)
      if (t < 1) setTimeout(tick, 16)
      else setPhase('scroll')
    }
    tick()
    return () => { cancelled = true }
  }, [phase])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const scrollSpring = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.4,
  })

  useEffect(() => {
    if (phase === 'scroll') {
      return scrollSpring.on('change', v => setCarProgress(Math.max(0, Math.min(1, v))))
    }
    if (phase === 'qualifying') setCarProgress(qualiProgress)
    else setCarProgress(0)
  }, [phase, qualiProgress, scrollSpring])

  useEffect(() => {
    if (!pathRef.current || totalLength === 0) return
    const { x, y } = pointAt(pathRef.current, totalLength, carProgress)
    dotRef.current?.setAttribute('cx', String(x))
    dotRef.current?.setAttribute('cy', String(y))
    pulseRef.current?.setAttribute('cx', String(x))
    pulseRef.current?.setAttribute('cy', String(y))
    if (pinLayerRef.current) {
      pinLayerRef.current.querySelectorAll<SVGGElement>('[data-pin]').forEach(pin => {
        const pos = parseFloat(pin.dataset.trackPos ?? '0')
        const near = Math.abs(pos - carProgress) < 0.05 && carProgress > 0
        pin.dataset.active = near ? '1' : '0'
      })
    }
  }, [carProgress, totalLength])

  // Drag-to-rotate. Ignore drags that start on a pin (<a> elements).
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (prefersReduced) return
    if ((e.target as Element).closest('a')) return
    dragStart.current = { px: e.clientX, py: e.clientY, tx: tilt.x, ty: tilt.y }
    setDragging(true)
    draggedDuringEntry.current = true // abort any in-flight entry tween
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [tilt.x, tilt.y, prefersReduced])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return
    // Pitch is locked — only yaw responds to horizontal drag. X stays at
    // whatever the entry animation set (DEFAULT_TILT_X).
    const dx = e.clientX - dragStart.current.px
    const nextY = clamp(dragStart.current.ty + dx * 0.3, -90, 90)
    setTilt(t => ({ ...t, y: nextY }))
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragStart.current = null
    setDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }, [])

  const resetTilt = useCallback(() => {
    setTilt({ x: DEFAULT_TILT_X, y: DEFAULT_TILT_Y, z: DEFAULT_TILT_Z })
  }, [])

  // Yaw is driven ONLY by user drag — no scroll override so releases don't
  // get clobbered by momentum-scroll change events.

  const active = races.reduce((best, r) =>
    Math.abs(r.trackPosition - carProgress) < Math.abs(best.trackPosition - carProgress) ? r : best,
  races[0])

  const vb = `${trackViewBox.x} ${trackViewBox.y} ${trackViewBox.w} ${trackViewBox.h}`
  const stageTransform = `perspective(2200px) rotateX(${tilt.x}deg) rotateZ(${tilt.y}deg)`

  return (
    <section
      ref={containerRef}
      className="relative min-h-[240vh]"
      aria-label="A1 Motor Park hero"
    >
      <div className="md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-[1400px] w-full md:h-full px-5 md:px-8 pb-6 md:pb-10 pt-5 md:pt-8 flex flex-col md:grid md:grid-cols-[1fr_360px] gap-8 md:gap-10 md:items-stretch">
          {/* LEFT — track stage */}
          <div className="relative flex flex-col min-h-[72vh] md:min-h-0">
            <div className="flex items-baseline justify-between gap-4 mb-3 md:mb-4">
              <p className="telemetry">{t('kicker')}</p>
              <p className="telemetry hidden md:block">
                {trackMeta.lengthM}M · {trackMeta.points}PTS · VB {trackMeta.viewBox.w}×{trackMeta.viewBox.h}
              </p>
            </div>

            <div className="relative flex-1 min-h-0">
              <Crosshair className="top-0 left-0" />
              <Crosshair className="top-0 right-0 rotate-90" />
              <Crosshair className="bottom-0 left-0 -rotate-90" />
              <Crosshair className="bottom-0 right-0 rotate-180" />

              <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2">
                <span className="telemetry !text-[10px]">
                  {prefersReduced
                    ? 'STATIC'
                    : dragging
                      ? `YAW · ${Math.round(tilt.y)}°`
                      : 'DRAG TO ROTATE'}
                </span>
                {Math.abs(tilt.y - DEFAULT_TILT_Y) > 1 && !prefersReduced && (
                  <button
                    type="button"
                    onClick={resetTilt}
                    className="font-mono uppercase tracking-mono text-[10px] text-ink/60 hover:text-brand border-b rule"
                  >
                    RESET
                  </button>
                )}
              </div>

              {/* 3D stage — track + pins live together in one preserve-3d tree */}
              <div
                ref={stageRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onDoubleClick={resetTilt}
                className={`absolute inset-4 md:inset-6 flex items-center justify-center touch-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ perspective: '2200px' }}
              >
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{
                    transform: stageTransform,
                    transformStyle: 'preserve-3d',
                    transition: dragging ? 'none' : 'transform 0.6s cubic-bezier(.2,.7,.2,1)',
                  }}
                >
                  {/* Ground shadow — far deeper than any depth layer, blurred */}
                  <svg
                    viewBox={vb}
                    preserveAspectRatio="xMidYMid meet"
                    className="absolute inset-0 max-h-full max-w-full m-auto pointer-events-none"
                    style={{ transform: 'translateZ(-30px)' }}
                    fill="none"
                    aria-hidden
                  >
                    <defs>
                      <filter id="shadow-blur">
                        <feGaussianBlur stdDeviation="10" />
                      </filter>
                    </defs>
                    <path
                      d={trackPath}
                      stroke="#000"
                      strokeOpacity="0.6"
                      strokeWidth="60"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      filter="url(#shadow-blur)"
                    />
                  </svg>

                  {/* Terrain echo — the white halo plate the track sits on */}
                  <svg
                    viewBox={vb}
                    preserveAspectRatio="xMidYMid meet"
                    className="absolute inset-0 max-h-full max-w-full m-auto pointer-events-none"
                    style={{ transform: 'translateZ(-20px)' }}
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d={trackPath}
                      stroke="var(--line)"
                      strokeOpacity="0.05"
                      strokeWidth="46"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    <path
                      d={trackPath}
                      stroke="var(--line)"
                      strokeOpacity="0.12"
                      strokeWidth="20"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  {/* Pit lane — sits between the terrain and the track */}
                  <svg
                    viewBox={vb}
                    preserveAspectRatio="xMidYMid meet"
                    className="absolute inset-0 max-h-full max-w-full m-auto pointer-events-none"
                    style={{ transform: 'translateZ(-17px)' }}
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d={pitPath}
                      stroke="var(--line)"
                      strokeOpacity="0.4"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  {/* Flat stacked depth — one continuous racing line drawn across
                      9 layers at different Z for thickness. 10 paths total, so
                      `stroke-dashoffset` updates via React state are cheap. */}
                  {DEPTH_LAYERS.map((layer, i) => {
                    const isTop = i === DEPTH_LAYERS.length - 1
                    return (
                      <svg
                        key={layer.z}
                        viewBox={vb}
                        preserveAspectRatio="xMidYMid meet"
                        className="absolute inset-0 max-h-full max-w-full m-auto pointer-events-none"
                        style={{ transform: `translateZ(${layer.z}px)` }}
                        fill="none"
                        aria-hidden
                      >
                        {isTop && (
                          <defs>
                            <filter id="neon-glow" x="-10%" y="-10%" width="120%" height="120%">
                              <feGaussianBlur stdDeviation="3" />
                              <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                        )}
                        <path
                          ref={isTop ? pathRef : undefined}
                          d={trackPath}
                          stroke={layer.color}
                          strokeOpacity={layer.opacity}
                          strokeWidth={layer.width}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                          filter={isTop ? 'url(#neon-glow)' : undefined}
                          style={{
                            strokeDasharray: totalLength || 1,
                            strokeDashoffset: (totalLength || 1) * (1 - drawProgress),
                          }}
                        />
                      </svg>
                    )
                  })}

                  {/* Pulse + car dot — floating above the top surface */}
                  <svg
                    viewBox={vb}
                    preserveAspectRatio="xMidYMid meet"
                    className="absolute inset-0 max-h-full max-w-full m-auto pointer-events-none"
                    style={{ transform: 'translateZ(8px)' }}
                    fill="none"
                    aria-hidden
                  >
                    <defs>
                      <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
                        <feGaussianBlur stdDeviation="6" />
                      </filter>
                    </defs>
                    <motion.circle
                      ref={pulseRef}
                      r={16}
                      fill="var(--brand)"
                      fillOpacity="0.4"
                      initial={{ opacity: 0 }}
                      animate={
                        phase === 'lights' || phase === 'drawing'
                          ? { opacity: 0 }
                          : prefersReduced
                            ? { opacity: 0.5 }
                            : { r: [12, 24, 12], opacity: [0.45, 0.08, 0.45] }
                      }
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                      }
                      filter="url(#dot-glow)"
                      style={{ mixBlendMode: 'screen' }}
                    />
                    <circle
                      ref={dotRef}
                      r={6}
                      fill="var(--ink)"
                      stroke="var(--brand)"
                      strokeWidth="2.5"
                      style={{
                        opacity: phase === 'lights' || phase === 'drawing' ? 0 : 1,
                        filter: 'drop-shadow(0 0 6px var(--brand))',
                      }}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  {/* Race pins — in the 3D stage so they rotate with the track.
                      pointer-events-none on the svg; each <a> re-enables them
                      so the track itself remains draggable. */}
                  {totalLength > 0 && (
                    <svg
                      ref={pinLayerRef}
                      viewBox={vb}
                      preserveAspectRatio="xMidYMid meet"
                      className="absolute inset-0 max-h-full max-w-full m-auto"
                      style={{ transform: 'translateZ(14px)', pointerEvents: 'none' }}
                      fill="none"
                    >
                      {races.map(race => {
                        const { x, y } = pointAt(pathRef.current, totalLength, race.trackPosition)
                        return (
                          <RacePin
                            key={race.id}
                            id={race.id}
                            x={x}
                            y={y}
                            trackPosition={race.trackPosition}
                            href={`/${locale}/events/${race.slug}`}
                          />
                        )
                      })}
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <ElevationStrip progress={carProgress} className="mt-3 md:mt-4" />
          </div>

          {/* RIGHT — info column */}
          <aside className="relative flex flex-col justify-between min-h-0">
            <div>
              <h1 className="font-display font-bold text-[44px] md:text-[56px] lg:text-[64px] leading-[0.95] tracking-tight">
                {t('title')}
              </h1>
              <p className="mt-2 font-mono tracking-mono uppercase text-[11px] text-ink/60">
                {t('subtitle')}
              </p>
              <p className="mt-5 md:mt-6 text-ink/75 text-[14px] md:text-[15px] leading-relaxed max-w-sm">
                {t('intro')}
              </p>
            </div>

            <div className="mt-6">
              <p className="telemetry mb-3">
                {phase === 'loading'
                  ? 'INITIALISING…'
                  : phase === 'lights'
                    ? 'GRID · LIGHTS OUT…'
                    : phase === 'scroll'
                      ? `FOCUS · LAP ${(carProgress * 100).toFixed(0)}%`
                      : phase === 'qualifying'
                        ? `QUALI LAP · ${(carProgress * 100).toFixed(0)}%`
                        : 'DRAWING LINE…'}
              </p>
              <div className="border rule p-4 bg-bg/80 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-mono tracking-mono uppercase text-[11px] text-brand">
                    R{active.id}
                  </div>
                  <div className="font-mono tracking-mono uppercase text-[10px] text-ink/50">
                    {teT(active.type)}
                  </div>
                </div>
                <p className="mt-1 font-display font-medium text-lg md:text-xl leading-tight">
                  {te(active.nameKey)}
                </p>
                <p className="mt-2 font-mono tracking-mono text-[11px] text-ink/60">
                  {active.dateLabel}
                  {active.dateTBD && (
                    <span className="ml-2 text-data/80">· {tc('statusTBD')}</span>
                  )}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={`/${locale}/calendar`}
                  className="text-center font-mono tracking-mono uppercase text-[11px] px-4 py-3 bg-brand text-ink hover:bg-brand-deep transition-colors"
                >
                  {t('ctaCalendar')}
                </a>
                <a
                  href={`/${locale}/track`}
                  className="text-center font-mono tracking-mono uppercase text-[11px] px-4 py-3 border rule text-ink hover:bg-ink/5 transition-colors"
                >
                  {t('ctaTrack')}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div aria-hidden className="h-[140vh]" />
    </section>
  )
}

function Crosshair({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute ${className} pointer-events-none z-[1]`}
      style={{ width: 18, height: 18 }}
    >
      <span className="absolute left-0 top-0 w-[18px] h-px bg-ink/20" />
      <span className="absolute left-0 top-0 w-px h-[18px] bg-ink/20" />
    </span>
  )
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}
