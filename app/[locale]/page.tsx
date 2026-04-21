import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { TrackHero } from '@/components/track/TrackHero'
import { RaceCard } from '@/components/calendar/RaceCard'
import { EventsShowcase } from '@/components/calendar/EventsShowcase'
import { FacilityMap } from '@/components/facilities/FacilityMap'
import { races } from '@/lib/data/races'
import { trackMeta } from '@/lib/data/track'

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = params
  setRequestLocale(locale)
  const t = await getTranslations('calendar')
  const tt = await getTranslations('track')
  const tf = await getTranslations('facilities')

  const featured = races.slice(0, 4)

  return (
    <>
      <TrackHero />

      <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between gap-6 mb-8 md:mb-12 flex-wrap">
          <div>
            <p className="telemetry mb-2">CALENDAR · 2026</p>
            <h2 className="font-display font-bold text-[36px] md:text-[48px] leading-tight tracking-tight">
              {t('title')}
            </h2>
            <p className="mt-2 text-ink/70 max-w-md">{t('subtitle')}</p>
          </div>
          <Link
            href={`/${locale}/calendar`}
            className="font-mono tracking-mono uppercase text-[11px] text-ink/70 hover:text-brand transition-colors border-b rule pb-1"
          >
            {t('moreInfo')} →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {featured.map((r, i) => (
            <RaceCard key={r.id} race={r} emphasis={i === 0} />
          ))}
        </div>
      </section>

      <EventsShowcase />

      <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-24 border-t rule">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 md:gap-14 items-center">
          <div>
            <p className="telemetry mb-2">TRACK · {trackMeta.lengthM}M</p>
            <h2 className="font-display font-bold text-[36px] md:text-[48px] leading-tight tracking-tight">
              {tt('heading')}
            </h2>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 max-w-md">
              <Stat label={tt('lengthLabel')} value="3,910 M" />
              <Stat label={tt('widthLabel')} value="15 M" />
              <Stat label={tt('turnsLabel')} value="15" />
              <Stat label={tt('pitboxesLabel')} value="25" />
              <Stat label={tt('altitudeLabel')} value="585 M" />
              <Stat label={tt('directionLabel')} value={tt('direction')} />
            </dl>
            <div className="mt-8">
              <Link
                href={`/${locale}/track`}
                className="font-mono tracking-mono uppercase text-[11px] text-ink/70 hover:text-brand transition-colors border-b rule pb-1"
              >
                {tt('elevationHeading')} →
              </Link>
            </div>
          </div>
          <figure>
            <FacilityMap />
            <figcaption className="mt-4 flex items-baseline justify-between">
              <p className="telemetry">{tf('title').toUpperCase()} · 14 POI</p>
              <Link
                href={`/${locale}/facilities`}
                className="font-mono tracking-mono uppercase text-[11px] text-ink/60 hover:text-brand transition-colors"
              >
                {tf('legendHeading')} →
              </Link>
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="telemetry mb-1">{label}</dt>
      <dd className="font-display font-medium text-[18px] md:text-[22px] text-ink">{value}</dd>
    </div>
  )
}
