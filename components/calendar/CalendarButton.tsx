import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { TextSwap } from '@/components/common/TextSwap'

export function CalendarButton() {
  const t = useTranslations('hero')
  const locale = useLocale()
  return (
    <Link
      href={`/${locale}/calendar`}
      className="btn-fill-sweep inline-flex items-center gap-2 font-mono tracking-mono uppercase text-[12px] px-5 py-3 bg-brand text-ink"
    >
      <TextSwap>{t('ctaCalendar')}</TextSwap>
      <span aria-hidden className="btn-arrow">→</span>
    </Link>
  )
}
