import Image from 'next/image'
import { getTranslations, getLocale } from 'next-intl/server'
import { pastEvents } from '@/lib/data/pastEvents'

export async function PastEvents() {
  const t = await getTranslations('pastEvents')
  const locale = await getLocale()

  if (pastEvents.length === 0) return null

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-24 border-t rule">
      <div className="flex items-end justify-between gap-6 mb-8 md:mb-12 flex-wrap">
        <div>
          <p className="telemetry mb-2">ARCHIVE · 2026</p>
          <h2 className="font-display font-bold text-[36px] md:text-[48px] leading-tight tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-2 text-ink/70 max-w-md">{t('subtitle')}</p>
        </div>
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {pastEvents.map(e => {
          const title = locale === 'bg' ? e.titleBg : e.titleEn
          return (
            <li key={e.id}>
              <article className="group border rule bg-bg/60 overflow-hidden hover:bg-bg/90 transition-colors">
                <a
                  href={e.ticketUrl ?? '#'}
                  target={e.ticketUrl ? '_blank' : undefined}
                  rel={e.ticketUrl ? 'noopener noreferrer' : undefined}
                  className="block"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={e.image}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/10 to-transparent opacity-70 group-hover:opacity-50 transition-opacity"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="font-mono tracking-mono uppercase text-[10px] bg-bg/70 backdrop-blur-sm px-2 py-1 text-ink/80">
                        PAST
                      </span>
                    </div>
                  </div>

                  <div className="p-4 md:p-5">
                    <p className="font-mono tracking-mono uppercase text-[10px] text-brand">
                      {e.kicker}
                    </p>
                    <h3 className="mt-1.5 font-display font-medium text-[18px] md:text-[20px] leading-tight">
                      {title}
                    </h3>
                    <p className="mt-2 font-mono tracking-mono text-[11px] text-ink/60">
                      {e.dateLabel}
                    </p>
                    {e.ticketUrl && (
                      <p className="mt-3 font-mono tracking-mono uppercase text-[10px] text-ink/60 group-hover:text-brand transition-colors">
                        {t('tickets')} →
                      </p>
                    )}
                  </div>
                </a>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
