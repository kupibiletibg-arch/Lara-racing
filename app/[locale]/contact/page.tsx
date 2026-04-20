import { setRequestLocale, getTranslations } from 'next-intl/server'

export default async function ContactPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations('contact')

  return (
    <section className="mx-auto max-w-[820px] px-5 md:px-8 py-12 md:py-20">
      <p className="telemetry mb-3">CONTACT</p>
      <h1 className="font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-tight">
        {t('title')}
      </h1>
      <p className="mt-6 text-ink/75 max-w-md">{t('body')}</p>

      <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-8 gap-y-6 max-w-lg">
        <dt className="telemetry">{t('addressLabel')}</dt>
        <dd className="font-display text-[18px]">{t('address')}</dd>

        <dt className="telemetry">{t('emailLabel')}</dt>
        <dd className="font-mono text-[14px]">
          <a href="mailto:info@a1motorpark.example" className="hover:text-brand transition-colors">
            info@a1motorpark.example
          </a>
        </dd>

        <dt className="telemetry">{t('phoneLabel')}</dt>
        <dd className="font-mono text-[14px]">+359 (0) 2 000 0000</dd>
      </dl>
    </section>
  )
}
