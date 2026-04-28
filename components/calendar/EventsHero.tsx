import Image from 'next/image'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { TextSwap } from '@/components/common/TextSwap'

type Category = {
  /** Query-string value for the calendar's `type` filter. */
  slug: 'cars' | 'moto' | 'endurance' | 'rally'
  image: string
  /** Optional CSS `object-position` so we can shift the crop focal
   *  point per-tile when a photo's subject doesn't sit dead-centre. */
  objectPosition?: string
}

const CATEGORIES: Category[] = [
  { slug: 'cars', image: '/events/cars-tile.webp' },
  // Pull the moto photo up so the full bike is in view — the source
  // frames the motorcycle toward the lower third of the shot, so the
  // default centre crop was clipping the front wheel.
  { slug: 'moto', image: '/events/moto-tile.webp', objectPosition: 'center 65%' },
  // Same story as the moto tile — the source frames the car slightly
  // below centre, so a plain centre crop cut off the top of the car.
  // Shift focus down the source so the image reads "pulled up" in the
  // tile.
  { slug: 'endurance', image: '/events/endurance-tile.webp', objectPosition: 'center 70%' },
  { slug: 'rally', image: '/events/rally-tile.webp' },
]

/**
 * Home-page events module modelled on nürburgring.de: a photo-lit hero on the
 * left with title/subtitle/CTA, and a stacked list of four category tiles on
 * the right. Each tile links to the full calendar pre-filtered by that type.
 */
export async function EventsHero() {
  const locale = await getLocale()
  const t = await getTranslations('calendar.featured')
  const tType = await getTranslations('eventType')

  const categories = CATEGORIES.map((c) => ({
    ...c,
    title: tType(c.slug),
    description: t(`categories.${c.slug}`),
    href: `/${locale}/calendar?type=${c.slug}`,
  }))

  return (
    <section className="relative border-t rule overflow-hidden">
      <div className="grid lg:grid-cols-2 min-h-[420px] lg:min-h-[560px]">
        {/* LEFT — hero copy */}
        <div className="relative flex items-center">
          <Image
            src="/events/events-hero-bg.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={55}
            className="object-cover opacity-35"
            aria-hidden
          />
          <div
            aria-hidden
            // Left-side-only darkening: solid near the title, fading to
            // fully transparent over the right half so the underlying
            // photo stays bright where it doesn't compete with the copy.
            className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent"
          />
          <div className="relative z-10 px-6 md:px-10 lg:px-14 py-12 md:py-16 lg:py-20 max-w-xl">
            <p className="telemetry mb-3">{t('kicker')}</p>
            <h2 className="font-display font-bold text-[56px] md:text-[72px] lg:text-[88px] leading-[0.9] tracking-tight">
              {t('title')}
            </h2>
            <p className="mt-4 md:mt-5 text-ink/85 text-[15px] md:text-[17px] leading-relaxed max-w-md">
              {t('subtitle')}
            </p>
            <Link
              href={`/${locale}/calendar`}
              className="btn-fill-sweep mt-6 md:mt-8 inline-flex items-center gap-2 bg-brand text-ink px-5 md:px-6 py-3 font-mono tracking-mono uppercase text-[11px] md:text-[12px]"
            >
              <TextSwap>{t('cta')}</TextSwap>
              <span aria-hidden className="btn-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* RIGHT — category tiles */}
        <ul className="grid grid-cols-1 grid-rows-4 border-t lg:border-t-0 lg:border-l rule">
          {categories.map((c, i) => (
            <li
              key={c.slug}
              className={i > 0 ? 'border-t rule' : undefined}
            >
              <Link href={c.href} className="group relative block h-full overflow-hidden">
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  quality={70}
                  className="object-cover opacity-55 group-hover:opacity-75 transition-opacity duration-300"
                  style={
                    c.objectPosition
                      ? { objectPosition: c.objectPosition }
                      : undefined
                  }
                  aria-hidden
                />
                <div
                  aria-hidden
                  // Same dark-on-left, transparent-on-right falloff as
                  // the left hero — the copy stays legible while the
                  // photo reads clearly from the middle onwards. Hover
                  // softens the left edge so the image breathes more.
                  className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/45 to-transparent group-hover:from-bg/75 group-hover:via-bg/30 transition-colors"
                />
                <div className="relative z-10 flex h-full items-center justify-between gap-4 px-6 md:px-8 py-6 md:py-8">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold uppercase text-[20px] md:text-[26px] leading-tight tracking-tight">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-ink/75 text-[12px] md:text-[14px] leading-snug max-w-sm">
                      {c.description}
                    </p>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    className="shrink-0 h-5 w-5 md:h-6 md:w-6 text-ink/60 group-hover:text-brand transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
