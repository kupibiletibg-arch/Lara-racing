'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { upcomingEvents } from '@/lib/data/upcomingEvents'
import { pastEvents } from '@/lib/data/pastEvents'

type EventItem = {
  id: string
  titleBg: string
  titleEn: string
  dateLabel: string
  kicker: string
  image: string
  ticketUrl?: string
}

type CarouselProps = {
  items: readonly EventItem[]
  kicker: string
  heading: string
  subtitle: string
  ticketsLabel: string
  badgeLabel: string
  /** 'brand' = solid red (upcoming); 'muted' = solid ink chip (past). */
  badgeTone: 'brand' | 'muted'
}

const SWIPE_PX = 50
const WHEEL_PX = 40
const WHEEL_LOCKOUT_MS = 400

function Carousel({
  items,
  kicker,
  heading,
  subtitle,
  ticketsLabel,
  badgeLabel,
  badgeTone,
}: CarouselProps) {
  const locale = useLocale()
  const [index, setIndex] = useState(0)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const swiped = useRef(false)
  const lastWheelAt = useRef(0)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const goTo = useCallback(
    (next: number) => {
      if (items.length === 0) return
      const n = ((next % items.length) + items.length) % items.length
      setIndex(n)
    },
    [items.length],
  )
  const prev = useCallback(() => goTo(index - 1), [goTo, index])
  const next = useCallback(() => goTo(index + 1), [goTo, index])

  // Touch gestures — swipe L/R. Tracks Y too so a diagonal gesture is
  // treated as a vertical scroll and not intercepted.
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    swiped.current = false
  }, [])
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      swiped.current = true
    }
  }, [])
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null
      touchStartY.current = null
      if (dx > SWIPE_PX) prev()
      else if (dx < -SWIPE_PX) next()
    },
    [prev, next],
  )

  // Desktop horizontal wheel (trackpad / shift+wheel). Attach a
  // non-passive listener so we can preventDefault and stop the page
  // from scrolling while the carousel consumes the gesture.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      const ax = Math.abs(e.deltaX)
      const ay = Math.abs(e.deltaY)
      if (ax <= ay || ax < WHEEL_PX) return
      const now = performance.now()
      if (now - lastWheelAt.current < WHEEL_LOCKOUT_MS) {
        e.preventDefault()
        return
      }
      lastWheelAt.current = now
      e.preventDefault()
      if (e.deltaX > 0) next()
      else prev()
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [next, prev])

  // If a drag was detected, swallow the click that follows on the
  // info-panel link so swipes don't accidentally navigate to tickets.
  const onInfoClick = useCallback(
    (e: React.MouseEvent) => {
      if (swiped.current) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [],
  )

  if (items.length === 0) return null

  const current = items[index]
  const title = locale === 'bg' ? current.titleBg : current.titleEn
  const canCycle = items.length > 1

  const badgeClasses =
    badgeTone === 'brand'
      ? 'bg-brand text-ink shadow-[0_2px_12px_rgba(200,16,46,0.35)]'
      : 'bg-ink text-bg'

  return (
    <div className="flex flex-col">
      <header className="mb-4">
        <p className="telemetry mb-1">{kicker}</p>
        <h2 className="font-display font-bold text-[26px] md:text-[32px] leading-tight tracking-tight">
          {heading}
        </h2>
        <p className="mt-1 text-ink/70 text-[14px]">{subtitle}</p>
      </header>

      <article className="group border rule bg-bg/60 overflow-hidden">
        <div
          ref={viewportRef}
          className="relative aspect-square w-full overflow-hidden select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'pan-y', overscrollBehaviorX: 'contain' }}
        >
          <Image
            key={current.id}
            src={current.image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            draggable={false}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/10 to-transparent opacity-70 pointer-events-none"
          />

          <span
            className={`absolute top-3 right-3 font-mono tracking-mono uppercase text-[12px] md:text-[13px] font-bold px-3 py-1.5 ${badgeClasses}`}
          >
            {badgeLabel}
          </span>

          {canCycle && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-ink text-bg hover:bg-brand hover:text-ink flex items-center justify-center shadow-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-ink text-bg hover:bg-brand hover:text-ink flex items-center justify-center shadow-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-ink' : 'w-2 bg-ink/50 hover:bg-ink/80'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <a
          href={current.ticketUrl ?? '#'}
          target={current.ticketUrl ? '_blank' : undefined}
          rel={current.ticketUrl ? 'noopener noreferrer' : undefined}
          onClick={onInfoClick}
          className="block p-4 md:p-5 hover:bg-bg/90 transition-colors"
        >
          <p className="font-mono tracking-mono uppercase text-[10px] text-brand">
            {current.kicker}
          </p>
          <h3 className="mt-1.5 font-display font-medium text-[18px] md:text-[20px] leading-tight">
            {title}
          </h3>
          <p className="mt-2 font-mono tracking-mono text-[11px] text-ink/60">
            {current.dateLabel}
          </p>
          {current.ticketUrl && (
            <p className="mt-3 font-mono tracking-mono uppercase text-[10px] text-ink/60 group-hover:text-brand transition-colors">
              {ticketsLabel} →
            </p>
          )}
        </a>
      </article>
    </div>
  )
}

export function EventsShowcase() {
  const tu = useTranslations('upcomingEvents')
  const tp = useTranslations('pastEvents')

  if (upcomingEvents.length === 0 && pastEvents.length === 0) return null

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-24 border-t rule">
      <div className="grid md:grid-cols-2 gap-8 md:gap-10">
        <Carousel
          items={upcomingEvents}
          kicker={tu('kicker')}
          heading={tu('title')}
          subtitle={tu('subtitle')}
          ticketsLabel={tu('tickets')}
          badgeLabel={tu('badge')}
          badgeTone="brand"
        />
        <Carousel
          items={pastEvents}
          kicker={tp('kicker')}
          heading={tp('title')}
          subtitle={tp('subtitle')}
          ticketsLabel={tp('tickets')}
          badgeLabel={tp('badge')}
          badgeTone="muted"
        />
      </div>
    </section>
  )
}
