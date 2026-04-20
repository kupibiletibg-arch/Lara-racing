import { useTranslations } from 'next-intl'
import { Logo } from '@/components/brand/Logo'
import { PartnersMarquee } from '@/components/partners/PartnersMarquee'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="relative mt-32 border-t rule">
      <div className="pt-10 md:pt-14">
        <p className="mx-auto max-w-[1400px] px-5 md:px-8 telemetry mb-4">
          {t('partners')}
        </p>
        <PartnersMarquee />
      </div>

      <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-12 md:py-16 grid md:grid-cols-[auto_1fr_auto] gap-8 items-start">
        <Logo />
        <div className="max-w-md">
          <p className="text-ink/80 font-display text-lg leading-snug">{t('tagline')}</p>
          <p className="mt-4 font-mono tracking-mono uppercase text-[11px] text-ink/50">
            Samokov · Bulgaria · 42°19′N 23°34′E · 585 m
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="font-mono tracking-mono uppercase text-[11px] text-ink/50">{t('ticketing')}</p>
          <p className="font-display font-medium text-ink">kupibileti.bg</p>
        </div>
      </div>
      <div className="border-t rule">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-4 font-mono tracking-mono uppercase text-[10px] text-ink/40">
          {t('copyright')}
        </div>
      </div>
    </footer>
  )
}
