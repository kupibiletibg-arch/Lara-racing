'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import clsx from 'clsx'
import type { Race } from '@/lib/data/races'
import { SessionTimes } from './SessionTimes'

type Props = {
  race: Race
  emphasis?: boolean
}

export function RaceCard({ race, emphasis }: Props) {
  const locale = useLocale()
  const t = useTranslations('calendar')
  const te = useTranslations('events')
  const teT = useTranslations('eventType')

  return (
    <article
      className={clsx(
        'group border rule p-5 md:p-6 transition-colors relative',
        emphasis
          ? 'bg-brand-deep/10 border-brand/40'
          : 'bg-bg/60 hover:bg-bg/90 backdrop-blur-sm',
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand via-brand/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono tracking-mono text-[12px] font-bold text-brand">
            R{race.id}
          </span>
          <span className="font-mono tracking-mono uppercase text-[10px] text-ink/50">
            {teT(race.type)}
          </span>
        </div>
        <div className="font-mono tracking-mono text-[11px] text-ink/70 text-right">
          {race.dateLabel}
          {race.dateTBD && <div className="text-[10px] text-data/70 mt-0.5">{t('statusTBD')}</div>}
        </div>
      </div>

      <h3 className="mt-3 font-display font-medium text-[20px] md:text-[24px] leading-tight text-ink">
        {te(race.nameKey)}
      </h3>

      {race.sessions && (
        <div className="mt-4 pt-4 border-t rule">
          <p className="telemetry mb-2">{t('sessionsLabel')}</p>
          <SessionTimes sessions={race.sessions} />
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <Link
          href={`/${locale}/events/${race.slug}`}
          className="font-mono tracking-mono uppercase text-[11px] text-ink/70 hover:text-brand transition-colors"
        >
          {t('info')} →
        </Link>
        <span className="font-mono tracking-mono uppercase text-[10px] text-ink/40">
          {t('tickets')}
        </span>
      </div>
    </article>
  )
}
