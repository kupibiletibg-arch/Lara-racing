import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ComingSoon } from '@/components/common/ComingSoon'

export default async function ExperiencesPage({
  params,
}: {
  params: { locale: string }
}) {
  setRequestLocale(params.locale)
  const t = await getTranslations('nav')
  return <ComingSoon title={t('experiences')} />
}
