'use client'

import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { useLocale, useTranslations } from 'next-intl'
import type { CatalogEvent } from '@/lib/calendar/buildCatalog'
import { formatShortStamp } from '@/lib/calendar/formatDateRange'

type Props = {
  event: CatalogEvent
  /** When true, renders as past (muted palette). */
  isPast?: boolean
}

/**
 * Nürburgring-inspired event tile: poster-forward, date stamp in the corner,
 * category chip on the opposite corner, compact footer with kicker + title +
 * date + CTAs.
 */
export function EventCard({ event, isPast }: Props) {
  const locale = useLocale() as 'bg' | 'en'
  const tCal = useTranslations('calendar')
  const tEvents = useTranslations('events')
  const tType = useTranslations('eventType')

  const title = event.nameKey
    ? tEvents(event.nameKey)
    : (locale === 'bg' ? event.titleBg : event.titleEn) ?? event.slug

  const categoryLabel = tType(event.category)
  const stamp = formatShortStamp(event.startDate, event.endDate, locale)
  const href = event.detailHref ? `/${locale}${event.detailHref}` : undefined

  const chipClass = clsx(
    'absolute top-3 left-3 font-mono tracking-mono uppercase text-[10px] md:text-[11px] font-bold px-2 py-1',
    isPast ? 'bg-ink text-bg' : 'bg-brand text-ink shadow-[0_2px_10px_rgba(200,16,46,0.3)]',
  )

  const Card = (
    <article
      className={clsx(
        'group border rule bg-bg/60 overflow-hidden transition-colors flex flex-col h-full',
        href && 'hover:bg-bg/90',
      )}
    >
      {/* Cover */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {event.image ? (
          <Image
            src={event.image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-deep/20 via-bg to-bg">
            <div className="text-center select-none">
              {stamp ? (
                <>
                  <p className="font-display font-bold text-[56px] md:text-[72px] leading-none text-ink/90">
                    {stamp.line1}
                  </p>
                  <p className="mt-2 font-mono tracking-mono uppercase text-[13px] md:text-[14px] text-brand">
                    {stamp.line2}
                  </p>
                </>
              ) : (
                <p className="font-mono tracking-mono uppercase text-[14px] text-ink/60">
                  {tCal('statusTBD')}
                </p>
              )}
            </div>
          </div>
        )}

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-bg/85 via-bg/10 to-transparent pointer-events-none"
        />

        <span className={chipClass}>{categoryLabel}</span>

        {/* Date stamp overlay — only when we have a parsed date AND there's a poster behind it */}
        {event.image && stamp && (
          <div className="absolute top-3 right-3 bg-ink text-bg px-2 py-1 font-mono tracking-mono text-[10px] md:text-[11px] font-bold uppercase">
            <div className="leading-none">{stamp.line1}</div>
            <div className="leading-none mt-0.5 text-bg/70 text-[9px] md:text-[10px]">
              {stamp.line2}
            </div>
          </div>
        )}

        {event.dateTBD && (
          <span className="absolute top-3 right-3 bg-bg/70 backdrop-blur-sm text-ink/80 font-mono tracking-mono uppercase text-[9px] md:text-[10px] px-2 py-1">
            {tCal('statusTBD')}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex-1 p-4 md:p-5 flex flex-col">
        {event.kicker && (
          <p className="font-mono tracking-mono uppercase text-[10px] text-brand">
            {event.kicker}
          </p>
        )}
        <h3 className="mt-1.5 font-display font-medium text-[18px] md:text-[22px] leading-tight text-ink">
          {title}
        </h3>
        <p className="mt-2 font-mono tracking-mono text-[11px] text-ink/60">
          {event.dateLabel}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-mono tracking-mono uppercase text-[10px] text-ink/60 group-hover:text-brand transition-colors">
            {href ? `${tCal('detailsCta')} →` : ' '}
          </span>
          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-mono tracking-mono uppercase text-[10px] text-ink/70 hover:text-brand transition-colors border-b rule pb-0.5"
            >
              {tCal('buyCta')} →
            </a>
          )}
        </div>
      </div>
    </article>
  )

  if (href) {
    return (
      <Link
        href={href}
        aria-label={title}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {Card}
      </Link>
    )
  }

  return Card
}
