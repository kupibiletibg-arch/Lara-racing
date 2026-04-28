import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/common/Reveal'

/**
 * Privacy policy page — referenced from the footer link.
 *
 * The body is rendered from a structured set of translation keys
 * (`privacy.sections.*`) so the document stays editable through the
 * message catalogues (bg/en) without code changes. Sections are
 * declared in one array below; each section has a translated heading
 * and body copy.
 *
 * NOTE: this is a reasonable starting template covering GDPR
 * essentials — it should be reviewed by legal counsel before going
 * to production for the actual operating entity.
 */
export default async function PrivacyPage({
  params,
}: {
  params: { locale: string }
}) {
  setRequestLocale(params.locale)
  const t = await getTranslations('privacy')

  const sectionKeys = [
    'intro',
    'data',
    'cookies',
    'usage',
    'sharing',
    'security',
    'rights',
    'changes',
    'contact',
  ] as const

  return (
    <section className="mx-auto max-w-[820px] px-5 md:px-8 py-12 md:py-20">
      <Reveal>
        <p className="telemetry mb-3">{t('kicker')}</p>
        <h1 className="font-display font-bold text-[40px] md:text-[56px] leading-[1] tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-4 font-mono tracking-mono text-[12px] text-ink/55">
          {t('lastUpdatedLabel')} {t('lastUpdated')}
        </p>
      </Reveal>

      <Reveal className="mt-10 prose prose-invert max-w-none">
        {sectionKeys.map(key => (
          <div
            key={key}
            className="mb-10 last:mb-0 border-t rule pt-8 first:border-t-0 first:pt-0"
          >
            <h2 className="font-display font-bold text-[22px] md:text-[26px] leading-tight tracking-tight mb-3">
              {t(`sections.${key}.heading`)}
            </h2>
            <p className="text-ink/80 leading-relaxed whitespace-pre-line">
              {t(`sections.${key}.body`)}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
