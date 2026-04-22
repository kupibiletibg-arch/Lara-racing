'use client'

import { useEffect, useRef, useState } from 'react'
import { Logo } from '@/components/brand/Logo'

/**
 * Full-viewport intro shown on initial mount:
 *   0.0 – 2.0 s  video plays full-frame
 *   2.0 – 3.2 s  video crossfades out, A1 Motor Park logo fades in
 *   3.2 – 3.8 s  logo held solo
 *   3.8 s        whole overlay fades for 500 ms, then unmounts and
 *                dispatches `'a1-ready'` so TrackHero can start.
 *
 * Respects `prefers-reduced-motion` by skipping the video entirely and
 * revealing just the logo for a brief moment.
 */

type Stage = 'video' | 'logo' | 'fade' | 'off'

export function LoadingScreen() {
  const [stage, setStage] = useState<Stage>('video')
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const timers: number[] = []
    const fireReady = () =>
      window.dispatchEvent(new CustomEvent('a1-ready'))

    if (reduced) {
      setStage('logo')
      timers.push(window.setTimeout(() => setStage('fade'), 500))
      timers.push(
        window.setTimeout(() => {
          setStage('off')
          fireReady()
        }, 1000),
      )
    } else {
      timers.push(window.setTimeout(() => setStage('logo'), 2000))
      timers.push(window.setTimeout(() => setStage('fade'), 3500))
      timers.push(
        window.setTimeout(() => {
          setStage('off')
          fireReady()
        }, 4100),
      )
    }

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [])

  // Best-effort autoplay: iOS Safari requires `playsInline` + `muted` +
  // the `play()` call to be kicked in response to the mount.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    const p = v.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }, [])

  if (stage === 'off') return null

  const fading = stage === 'fade'
  const showLogo = stage === 'logo' || stage === 'fade'

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[200] bg-bg flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/loading/intro.mp4"
        poster="/loading/intro-poster.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-out ${
          showLogo ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        className={`relative z-10 transition-opacity duration-[1200ms] ease-out ${
          showLogo ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Logo className="!h-24 md:!h-32" />
      </div>
    </div>
  )
}
