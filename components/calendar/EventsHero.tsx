import Image from 'next/image'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'

type Category = {
  /** Query-string value for the calendar's `type` filter. */
  slug: 'cars' | 'moto' | 'endurance' | 'rally'
  image: string
}

const CATEGORIES: Category[] = [
  { slug: 'cars', image: '/events/bmw-cup-2026.webp' },
  { slug: 'moto', image: '/events/gd-racing-2026-04.webp' },
  { slug: 'endurance', image: '/events/bes-999-2026.webp' },
  { slug: 'rally', image: '/events/premium-rally-2026-05.webp' },
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
            className="object-cover opacity-35"
            aria-hidden
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-bg via-bg/90 to-bg/60"
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
              className="mt-6 md:mt-8 inline-flex items-center gap-2 bg-brand hover:bg-brand-deep text-ink px-5 md:px-6 py-3 font-mono tracking-mono uppercase text-[11px] md:text-[12px] transition-colors"
            >
              {t('cta')} →
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
                  className="object-cover opacity-55 group-hover:opacity-75 transition-opacity duration-300"
                  aria-hidden
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/40 to-transparent group-hover:from-bg/75 transition-colors"
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
