import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export function CalendarButton() {
  const t = useTranslations('hero')
  const locale = useLocale()
  return (
    <Link
      href={`/${locale}/calendar`}
      className="inline-flex items-center gap-2 font-mono tracking-mono uppercase text-[12px] px-5 py-3 bg-brand text-ink hover:bg-brand-deep transition-colors"
    >
      {t('ctaCalendar')}
      <span aria-hidden>→</span>
    </Link>
  )
}
