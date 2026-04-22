import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/brand/Logo'
import { PartnersMarquee } from '@/components/partners/PartnersMarquee'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="relative mt-32 border-t rule">
      <div className="pt-8 md:pt-12">
        <PartnersMarquee />
      </div>

      <div className="w-full px-3 md:px-4 pt-12 md:pt-16 pb-4 md:pb-6 flex items-end justify-between gap-6">
        <div className="flex items-end">
          <Logo className="!h-10 md:!h-28" />
        </div>
        <div className="max-w-md text-center hidden md:flex md:items-end">
          <div>
            <p className="text-ink/80 font-display text-lg leading-snug">{t('tagline')}</p>
            <p className="mt-4 font-mono tracking-mono uppercase text-[11px] text-ink/50">
              Samokov · Bulgaria · 42°19′N 23°34′E · 585 m
            </p>
          </div>
        </div>
        <a
          href="https://www.kupibileti.bg/bg/about-event/2292"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="kupibileti.bg"
          className="flex items-end hover:opacity-90 transition-opacity"
        >
          <Image
            src="/partners/kupibileti.svg"
            alt="kupibileti.bg"
            width={1007}
            height={307}
            className="h-10 md:h-10 w-auto"
          />
        </a>
      </div>
      <div className="border-t rule">
        <div className="w-full px-3 md:px-4 py-4 font-mono tracking-mono uppercase text-[10px] text-ink/40">
          {t('copyright')}
        </div>
      </div>
    </footer>
  )
}
