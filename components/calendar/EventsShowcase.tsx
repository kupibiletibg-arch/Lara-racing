'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
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
  /** 'brand' = red, solid ink on red (upcoming); 'muted' = small translucent chip (past). */
  badgeTone: 'brand' | 'muted'
}

const SWIPE_PX = 50

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

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null
      if (dx > SWIPE_PX) prev()
      else if (dx < -SWIPE_PX) next()
    },
    [prev, next],
  )

  if (items.length === 0) return null

  const current = items[index]
  const title = locale === 'bg' ? current.titleBg : current.titleEn
  const canCycle = items.length > 1

  const badgeClasses =
    badgeTone === 'brand'
      ? 'bg-brand/90 text-ink'
      : 'bg-bg/70 backdrop-blur-sm text-ink/80'

  return (
    <div className="flex flex-col">
      <header className="mb-4">
        <p className="telemetry mb-1">{kicker}</p>
        <h2 className="font-display font-bold text-[26px] md:text-[32px] leading-tight tracking-tight">
          {heading}
        </h2>
        <p className="mt-1 text-ink/70 text-[14px]">{subtitle}</p>
      </header>

      <article className="group border rule bg-bg/60 overflow-hidden hover:bg-bg/90 transition-colors">
        <a
          href={current.ticketUrl ?? '#'}
          target={current.ticketUrl ? '_blank' : undefined}
          rel={current.ticketUrl ? 'noopener noreferrer' : undefined}
          className="block"
        >
          <div
            className="relative aspect-square w-full overflow-hidden select-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: 'pan-y', overscrollBehaviorX: 'contain' }}
          >
            <Image
              key={current.id}
              src={current.image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-opacity duration-300"
              draggable={false}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/10 to-transparent opacity-70 group-hover:opacity-50 transition-opacity pointer-events-none"
            />
            <span
              className={`absolute top-3 left-3 font-mono tracking-mono uppercase text-[10px] px-2 py-1 ${badgeClasses}`}
            >
              {badgeLabel}
            </span>

            {canCycle && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    prev()
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg/70 backdrop-blur-sm text-ink/80 hover:text-ink hover:bg-bg/90 flex items-center justify-center transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    next()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg/70 backdrop-blur-sm text-ink/80 hover:text-ink hover:bg-bg/90 flex items-center justify-center transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {items.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 rounded-full transition-all ${i === index ? 'w-5 bg-ink' : 'w-1.5 bg-ink/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-4 md:p-5">
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
          </div>
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
