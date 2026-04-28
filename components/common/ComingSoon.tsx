import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { TextSwap } from '@/components/common/TextSwap'

/**
 * Placeholder section used by every "coming soon" stub page. Matches
 * the site's standard scaffold (`max-w-[1400px]`, telemetry kicker,
 * display heading, ink/brand CTA) so the stubs don't feel like dead
 * holes in the navigation while the real content is being prepared.
 */
export async function ComingSoon({
  title,
  kicker,
}: {
  title: string
  /** Optional small caps label above the heading. Defaults to the
   *  shared `comingSoon.kicker` string. */
  kicker?: string
}) {
  const t = await getTranslations('comingSoon')
  const locale = await getLocale()
  const actualKicker = kicker ?? t('kicker')

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-28 min-h-[60vh] flex flex-col justify-center">
      <p className="telemetry mb-3">{actualKicker}</p>
      <h1 className="font-display font-bold text-[44px] md:text-[72px] leading-[0.95] tracking-tight max-w-3xl">
        {title}
      </h1>
      <p className="mt-5 text-ink/75 text-[15px] md:text-[17px] leading-relaxed max-w-md">
        {t('body')}
      </p>
      <div className="mt-10">
        <Link
          href={`/${locale}`}
          className="btn-fill-sweep inline-flex items-center gap-2 font-mono tracking-mono uppercase text-[11px] md:text-[12px] px-5 py-3 bg-brand text-ink"
        >
          <span aria-hidden>←</span>
          <TextSwap>{t('back')}</TextSwap>
        </Link>
      </div>
    </section>
  )
}
