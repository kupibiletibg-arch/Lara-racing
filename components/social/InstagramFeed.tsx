'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { instagramPosts } from '@/lib/data/instagramPosts'

/**
 * Hand-curated Instagram feed rendered via the official Instagram oEmbed
 * markup (`<blockquote class="instagram-media">`). `//www.instagram.com/embed.js`
 * transforms the blockquotes into iframes once it finishes loading, and we
 * call `window.instgrm.Embeds.process()` on mount so subsequent client-side
 * navigation also triggers embed expansion.
 *
 * Layout: one shared row of 5 equal tiles on lg (all reels side-by-side);
 * wraps down to 3-col / 2-col / 1-col on smaller breakpoints.
 */
declare global {
  interface Window {
    instgrm?: {
      Embeds?: { process?: () => void }
    }
  }
}

export function InstagramFeed() {
  const t = useTranslations('social')

  useEffect(() => {
    // Re-scan on mount in case the script was loaded by a previous route.
    window.instgrm?.Embeds?.process?.()
  }, [])

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

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {instagramPosts.map((p, i) => (
          <li
            key={`${p.permalink}-${i}`}
            className="[&_.instagram-media]:!m-0 [&_.instagram-media]:!min-w-0 [&_.instagram-media]:!w-full"
          >
            <blockquote
              className="instagram-media"
              data-instgrm-captioned
              data-instgrm-permalink={p.permalink}
              data-instgrm-version="14"
              style={{ background: '#050505' }}
            >
              {p.caption && (
                <a
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 text-ink/70 text-sm"
                >
                  {p.caption}
                </a>
              )}
            </blockquote>
          </li>
        ))}
      </ul>

      {/* Official Instagram embed runtime. `afterInteractive` lets it load
          once the page is interactive; subsequent mounts call the
          re-processing hook in the useEffect above. */}
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.instgrm?.Embeds?.process?.()
        }}
      />
    </section>
  )
}
