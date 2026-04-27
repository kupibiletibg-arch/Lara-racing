import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { BuyVoucherButton } from './BuyVoucherButton'

type Props = {
  /** Which open-track-day format to render. */
  slug: 'auto' | 'moto'
}

const IMAGE_BY_SLUG: Record<Props['slug'], string> = {
  auto: '/events/cars-tile.webp',
  moto: '/events/moto-tile.webp',
}

/**
 * Marketing card for one open-track-day format on /calendar/track-days.
 * Frame + dimming gradient + price chips mirror the existing
 * EventsHero tiles + EventCard chrome so the Auto/Moto cards visually
 * hand off to the rest of the events module.
 */
export async function TrackDayCard({ slug }: Props) {
  const t = await getTranslations('trackDays')
  const titleKey = slug === 'auto' ? 'card.autoTitle' : 'card.motoTitle'
  const descKey = slug === 'auto' ? 'card.autoDescription' : 'card.motoDescription'
  const weekPriceKey =
    slug === 'auto' ? 'card.autoWeekPrice' : 'card.motoWeekPrice'
  const weekendPriceKey =
    slug === 'auto' ? 'card.autoWeekendPrice' : 'card.motoWeekendPrice'

  return (
    <article className="relative overflow-hidden border rule bg-bg/60 backdrop-blur-md">
      {/* Right-side photo with the same left-dim gradient EventsHero
          tiles use, so the cards rhyme with the rest of the events
          module. */}
      <Image
        src={IMAGE_BY_SLUG[slug]}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        quality={70}
        className="object-cover opacity-55"
        aria-hidden
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-transparent"
      />

      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col gap-5 md:gap-6 max-w-xl">
        <div>
          <p className="telemetry mb-2">
            {slug === 'auto' ? 'AUTO' : 'MOTO'} · OPEN DAY
          </p>
          <h3 className="font-display font-bold uppercase text-[28px] md:text-[36px] leading-tight tracking-tight">
            {t(titleKey)}
          </h3>
          <p className="mt-3 text-ink/75 text-[13px] md:text-[14px] leading-relaxed max-w-md">
            {t(descKey)}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 md:gap-4">
          <PriceChip label={t('card.priceWeek')} value={t(weekPriceKey)} />
          <PriceChip label={t('card.priceWeekend')} value={t(weekendPriceKey)} />
        </div>

        <BuyVoucherButton />
      </div>
    </article>
  )
}

function PriceChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rule px-4 py-2.5 bg-bg/40">
      <p className="telemetry !text-[10px] mb-1">{label}</p>
      <p className="font-display font-bold text-[18px] md:text-[20px] text-brand leading-none tabular-nums">
        {value}
      </p>
    </div>
  )
}
