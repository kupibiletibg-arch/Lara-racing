import { setRequestLocale, getTranslations } from 'next-intl/server'

export default async function AboutPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations('about')

  return (
    <section className="mx-auto max-w-[820px] px-5 md:px-8 py-12 md:py-20">
      <p className="telemetry mb-3">ABOUT</p>
      <h1 className="font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-tight">
        {t('title')}
      </h1>
      <p className="mt-8 text-ink/85 text-[17px] md:text-[19px] leading-relaxed">{t('body')}</p>
    </section>
  )
}
