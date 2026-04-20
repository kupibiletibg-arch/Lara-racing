import { setRequestLocale, getTranslations } from 'next-intl/server'
import { RaceCard } from '@/components/calendar/RaceCard'
import { races } from '@/lib/data/races'

export default async function CalendarPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations('calendar')

  return (
    <section className="mx-auto max-w-[1200px] px-5 md:px-8 py-12 md:py-20">
      <p className="telemetry mb-3">SEASON · 2026</p>
      <h1 className="font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-tight">
        {t('title')}
      </h1>
      <p className="mt-4 text-ink/70 max-w-md">{t('subtitle')}</p>

      <ul className="mt-10 md:mt-14 grid md:grid-cols-2 gap-4 md:gap-6">
        {races.map(r => (
          <li key={r.id}>
            <RaceCard race={r} />
          </li>
        ))}
      </ul>
    </section>
  )
}
