import { setRequestLocale, getTranslations } from 'next-intl/server'
import { FacilityMap } from '@/components/facilities/FacilityMap'
import { FacilityLegend } from '@/components/facilities/FacilityLegend'

export default async function FacilitiesPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations('facilities')

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-12 md:py-20">
      <p className="telemetry mb-3">CIRCUIT · POI</p>
      <h1 className="font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-tight">
        {t('title')}
      </h1>
      <p className="mt-4 text-ink/70 max-w-md">{t('subtitle')}</p>

      <div className="mt-10 md:mt-14">
        <FacilityMap />
      </div>

      <div className="mt-14">
        <h2 className="telemetry mb-6">{t('legendHeading').toUpperCase()}</h2>
        <FacilityLegend />
      </div>
    </section>
  )
}
