import { setRequestLocale, getTranslations } from 'next-intl/server'
import { partners } from '@/lib/data/partners'
import { PartnerTile } from '@/components/partners/PartnerTile'
import { Reveal, RevealStagger, RevealItem } from '@/components/common/Reveal'

export default async function PartnersPage({
  params,
}: {
  params: { locale: string }
}) {
  setRequestLocale(params.locale)
  const t = await getTranslations('partners')

  return (
    <section className="mx-auto max-w-[1200px] px-5 md:px-8 py-12 md:py-20">
      <Reveal>
        <p className="telemetry mb-3">{t('kicker')}</p>
        <h1 className="font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-5 md:mt-6 max-w-2xl text-ink/80 text-[16px] md:text-[18px] leading-relaxed">
          {t('intro')}
        </p>
      </Reveal>

      <RevealStagger
        className="mt-12 md:mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5"
        staggerGap={0.06}
      >
        {partners.map((p) => (
          <RevealItem key={p.slug}>
            <PartnerTile partner={p} size="md" />
          </RevealItem>
        ))}
      </RevealStagger>
    </section>
  )
}
