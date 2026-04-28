import { setRequestLocale, getTranslations } from 'next-intl/server'
import { FacilityMap } from '@/components/facilities/FacilityMap'
import { FacilityLegend } from '@/components/facilities/FacilityLegend'
import { Reveal } from '@/components/common/Reveal'

export default async function FacilitiesPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations('facilities')

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-12 md:py-20">
      <Reveal>
        <p className="telemetry mb-3">CIRCUIT · POI</p>
        <h1 className="font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-4 text-ink/70 max-w-md">{t('subtitle')}</p>
      </Reveal>

      {/* Two-column layout: schema on the left, numbered legend on the
          right. `lg:grid-cols-[1.3fr_1fr]` keeps the schema dominant
          while the legend column still has room for two sub-columns of
          lines. Below lg the panes stack (schema above, legend below)
          because both need the full viewport width on phones / tablets
          in portrait. */}
      <Reveal
        className="mt-10 md:mt-14 grid gap-8 lg:gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-start"
        delay={0.1}
      >
        <div className="min-w-0">
          <FacilityMap />
        </div>
        <div className="min-w-0">
          <h2 className="telemetry mb-6">{t('legendHeading').toUpperCase()}</h2>
          <FacilityLegend />
        </div>
      </Reveal>
    </section>
  )
}
