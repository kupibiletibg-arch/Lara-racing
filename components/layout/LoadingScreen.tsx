'use client'

import { useEffect, useRef, useState } from 'react'
import { Logo } from '@/components/brand/Logo'

/**
 * Full-viewport intro overlay shown on initial mount.
 *
 * Layers (back → front):
 *   1. ambient intro video, dimmed to 55 % opacity so it never blasts the eye
 *   2. radial-gradient vignette so edges fall off to --bg
 *   3. A1 Motor Park logo, visible from the first frame until the overlay
 *      fades out — gives the brand a stable anchor throughout the intro
 *
 * Timing (normal motion):
 *   0 ms       overlay on, logo centred at full opacity, video starts
 *   ~900 ms    logo scale settles (1.04 → 1 via CSS transition)
 *   3600 ms    overlay begins fading (500 ms)
 *   4100 ms    overlay unmounts + dispatches `'a1-ready'` for TrackHero
 *
 * `prefers-reduced-motion: reduce` skips the video entirely; just shows
 * the logo for ~800 ms then fades.
 */

type Stage = 'on' | 'fade' | 'off'

// Lives in module scope — resets only on a real page reload / fresh tab.
// Keeps the intro from replaying on client-side navigation (menu → menu,
// locale switch BG ↔ EN) while still firing on the initial visit and on
// hard refresh.
let introPlayed = false

export function LoadingScreen() {
  const [stage, setStage] = useState<Stage>(() => (introPlayed ? 'off' : 'on'))
  const [settled, setSettled] = useState(false)
  const [reduced, setReduced] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Stage scheduler + reduced-motion detection.
  useEffect(() => {
    // Already played in this page lifetime — skip the sequence but still
    // notify downstream listeners that the page is ready to animate.
    if (introPlayed) {
      window.dispatchEvent(new CustomEvent('a1-ready'))
      return
    }
    introPlayed = true

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduced(prefersReduced)

    // One rAF after mount kicks the logo's scale-settle transition.
    const rafId = requestAnimationFrame(() => setSettled(true))

    const timers: number[] = []
    const fireReady = () =>
      window.dispatchEvent(new CustomEvent('a1-ready'))

    if (prefersReduced) {
      timers.push(window.setTimeout(() => setStage('fade'), 800))
      timers.push(
        window.setTimeout(() => {
          setStage('off')
          fireReady()
        }, 1300),
      )
    } else {
      timers.push(window.setTimeout(() => setStage('fade'), 3600))
      timers.push(
        window.setTimeout(() => {
          setStage('off')
          fireReady()
        }, 4100),
      )
    }

    return () => {
      cancelAnimationFrame(rafId)
      timers.forEach(clearTimeout)
    }
  }, [])

  // iOS Safari autoplay nudge — muted + playsInline + explicit play().
  useEffect(() => {
    if (reduced) return
    const v = videoRef.current
    if (!v) return
    v.muted = true
    const p = v.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }, [reduced])

  if (stage === 'off') return null

  const fading = stage === 'fade'

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[200] bg-bg flex items-center justify-center overflow-hidden transition-opacity duration-500 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {!reduced && (
        <video
          ref={videoRef}
          src="/loading/intro.mp4"
          poster="/loading/intro-poster.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
      )}

      {/* Vignette — tints edges toward --bg, pulls focus to the centre */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(5,5,5,0.35) 45%, rgba(5,5,5,0.9) 100%)',
        }}
      />

      {/* Persistent logo — present from first frame to unmount */}
      <div
        className={`relative z-10 transition-transform duration-[900ms] ease-out will-change-transform ${
          settled ? 'scale-100' : 'scale-[1.04]'
        }`}
        style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.6))' }}
      >
        <Logo className="!h-24 md:!h-32" />
      </div>
    </div>
  )
}
