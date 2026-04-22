'use client'

import { useTranslations } from 'next-intl'
import { instagramPosts } from '@/lib/data/instagramPosts'

/**
 * Hand-curated Instagram feed rendered as direct `/reel/<SHORTCODE>/embed/`
 * iframes. Each iframe receives `allow="autoplay; encrypted-media; fullscreen;
 * picture-in-picture"` which is what lets Instagram's reel player start the
 * video inline when the viewer taps play, instead of bouncing them out to
 * instagram.com.
 *
 * Each tile is wrapped in an aspect-[9/16] box so all five tiles share the
 * exact same shape regardless of IG's own chrome sizing.
 */
export function InstagramFeed() {
  const t = useTranslations('social')

  if (instagramPosts.length === 0) return null

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-24 border-t rule">
      <div className="flex items-end justify-between gap-6 mb-8 md:mb-12 flex-wrap">
        <div>
          <p className="telemetry mb-2">{t('kicker')}</p>
          <h2 className="font-display font-bold text-[36px] md:text-[48px] leading-tight tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-2 text-ink/70 max-w-md">{t('subtitle')}</p>
        </div>
        <a
          href="https://www.instagram.com/a1.motor.park/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono tracking-mono uppercase text-[11px] text-ink/70 hover:text-brand transition-colors border-b rule pb-1"
          aria-label="A1 Motor Park on Instagram"
        >
          @a1.motor.park →
        </a>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {instagramPosts.map((p) => (
          <ReelTile key={p.permalink} permalink={p.permalink} />
        ))}
      </ul>
    </section>
  )
}

function ReelTile({ permalink }: { permalink: string }) {
  const embedUrl = `${permalink.replace(/\/$/, '')}/embed`
  return (
    <li>
      <div className="relative w-full aspect-[9/16] overflow-hidden bg-[#050505]">
        <iframe
          src={embedUrl}
          title="Instagram reel"
          loading="lazy"
          scrolling="no"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </li>
  )
}
