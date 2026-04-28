import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { races } from '@/lib/data/races'
import { SessionTimes } from '@/components/calendar/SessionTimes'
import { Reveal } from '@/components/common/Reveal'

export function generateStaticParams() {
  return races.flatMap(r => [
    { locale: 'bg', slug: r.slug },
    { locale: 'en', slug: r.slug },
  ])
}

export default async function EventPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  setRequestLocale(params.locale)
  const race = races.find(r => r.slug === params.slug)
  if (!race) notFound()

  const t = await getTranslations('calendar')
  const te = await getTranslations('events')
  const teT = await getTranslations('eventType')

  return (
    <section className="mx-auto max-w-[820px] px-5 md:px-8 py-12 md:py-20">
      <Link
        href={`/${params.locale}/calendar`}
        className="font-mono tracking-mono uppercase text-[11px] text-ink/60 hover:text-brand transition-colors"
      >
        ← {t('title')}
      </Link>

      <Reveal>
        <div className="mt-6 flex items-baseline gap-3">
          <span className="font-mono tracking-mono text-[13px] font-bold text-brand">
            R{race.id}
          </span>
          <span className="font-mono tracking-mono uppercase text-[10px] text-ink/50">
            {teT(race.type)}
          </span>
        </div>

        <h1 className="mt-3 font-display font-bold text-[36px] md:text-[52px] leading-[1] tracking-tight">
          {te(race.nameKey)}
        </h1>

        <p className="mt-4 font-mono tracking-mono text-[13px] text-ink/70">
          {race.dateLabel}
          {race.dateTBD && <span className="ml-2 text-data/80">· {t('statusTBD')}</span>}
        </p>
      </Reveal>

      {race.sessions && (
        <Reveal className="mt-10 border-t rule pt-6 max-w-md">
          <p className="telemetry mb-3">{t('sessionsLabel')}</p>
          <SessionTimes sessions={race.sessions} />
        </Reveal>
      )}

      <Reveal className="mt-10">
        <p className="telemetry mb-3">{t('tickets')}</p>
        <p className="text-ink/60">—</p>
      </Reveal>
    </section>
  )
}
