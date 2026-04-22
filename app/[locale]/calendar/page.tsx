import { Suspense } from 'react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { buildCatalog } from '@/lib/calendar/buildCatalog'
import { EventsCatalog } from '@/components/calendar/EventsCatalog'

export default async function CalendarPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations('calendar')
  const events = buildCatalog()

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-12 md:py-20">
      <p className="telemetry mb-3">SEASON · 2026</p>
      <h1 className="font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-tight">
        {t('title')}
      </h1>
      <p className="mt-4 max-w-xl text-ink/70 text-[15px] md:text-[16px] leading-relaxed">
        {t('subtitle')}
      </p>

      <div className="mt-10 md:mt-14">
        <Suspense fallback={null}>
          <EventsCatalog events={events} />
        </Suspense>
      </div>
    </section>
  )
}
