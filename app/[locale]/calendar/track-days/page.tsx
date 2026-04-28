import Image from 'next/image'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { TrackDayCard } from '@/components/calendar/TrackDayCard'
import { TrackDayInfo } from '@/components/calendar/TrackDayInfo'
import { TrackDayExtras } from '@/components/calendar/TrackDayExtras'
import { TextSwap } from '@/components/common/TextSwap'
import { Reveal, RevealStagger, RevealItem } from '@/components/common/Reveal'

export default async function TrackDaysPage({
  params,
}: {
  params: { locale: string }
}) {
  setRequestLocale(params.locale)
  const t = await getTranslations('trackDays')
  const { locale } = params

  return (
    <>
      {/* Same dimmed circuit-render background as /track so the two
          product pages visually rhyme. Sits behind every page block
          via `-z-10` inside the z-10 layout stacking context. */}
      <div aria-hidden className="fixed inset-0 pointer-events-none -z-10">
        <Image
          src="/track/page-bg.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-35"
          priority={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(5,5,5,0.35) 0%, rgba(5,5,5,0.75) 60%, rgba(5,5,5,0.92) 100%)',
          }}
        />
      </div>

      <section className="relative mx-auto max-w-[1200px] px-5 md:px-8 py-12 md:py-20">
        {/* Header */}
        <Reveal>
          <p className="telemetry mb-3">{t('kicker')}</p>
          <h1 className="font-display font-bold uppercase text-[44px] md:text-[64px] leading-[0.95] tracking-tight">
            {t('title')}
          </h1>
          <p className="mt-4 md:mt-5 text-ink/80 text-[15px] md:text-[17px] leading-relaxed max-w-2xl">
            {t('intro')}
          </p>

          {/* Secondary CTA — sends the visitor to the full season
              catalog so they can see how the open-track-day formats sit
              inside the rest of the calendar. Outlined treatment so it
              doesn't compete with the brand-red voucher CTA on the
              cards below. */}
          <div className="mt-6 md:mt-8">
            <Link
              href={`/${locale}/calendar`}
              className="btn-fill-sweep btn-fill-sweep--outline inline-flex items-center gap-2 border rule px-5 md:px-6 py-3 font-mono tracking-mono uppercase text-[11px] md:text-[12px] text-ink/85"
            >
              <TextSwap>{t('viewCalendar')}</TextSwap>
              <span aria-hidden className="btn-arrow">→</span>
            </Link>
          </div>
        </Reveal>

        {/* Two product cards (Auto + Moto) staggered. */}
        <RevealStagger
          className="mt-10 md:mt-14 grid lg:grid-cols-2 gap-6 md:gap-8"
          staggerGap={0.12}
        >
          <RevealItem>
            <TrackDayCard slug="auto" />
          </RevealItem>
          <RevealItem>
            <TrackDayCard slug="moto" />
          </RevealItem>
        </RevealStagger>

        <Reveal>
          <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-ink/65 text-[13px] md:text-[14px]">
            <span className="font-mono tracking-mono uppercase text-[10px] md:text-[11px] text-ink/55">
              {t('contact.label')}
            </span>
            <a
              href={`tel:${t('contact.phone').replace(/\s+/g, '')}`}
              className="font-mono tracking-mono hover:text-brand transition-colors"
            >
              {t('contact.phone')}
            </a>
            <a
              href={`mailto:${t('contact.email')}`}
              className="font-mono tracking-mono hover:text-brand transition-colors"
            >
              {t('contact.email')}
            </a>
          </div>
        </Reveal>

        {/* Important / Included two-column block */}
        <Reveal className="mt-16 md:mt-24 border-t rule pt-12 md:pt-16">
          <TrackDayInfo />
        </Reveal>

        {/* Add-on tariff grid */}
        <Reveal className="mt-16 md:mt-24 border-t rule pt-12 md:pt-16">
          <TrackDayExtras />
        </Reveal>
      </section>
    </>
  )
}
