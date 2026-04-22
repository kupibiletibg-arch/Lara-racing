'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { instagramPosts } from '@/lib/data/instagramPosts'

/**
 * Hand-curated Instagram feed rendered as direct `/reel/<SHORTCODE>/embed/`
 * iframes (no `embed.js`, no captions). The section is lazy-mounted via an
 * IntersectionObserver so the iframes — and the native Instagram autoplay
 * behaviour of the first visible reel — trigger exactly when the user
 * scrolls the section into view.
 *
 * Layout: a 4-col grid with the first reel occupying a featured 2×2 cell so
 * the top-of-section video reads as the focal point.
 */
export function InstagramFeed() {
  const t = useTranslations('social')
  const sectionRef = useRef<HTMLElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (shouldLoad) return
    const node = sectionRef.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px 200px 0px', threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldLoad])

  if (instagramPosts.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-24 border-t rule"
    >
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

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {instagramPosts.map((post, i) => (
          <ReelTile
            key={post.permalink}
            permalink={post.permalink}
            featured={i === 0}
            shouldLoad={shouldLoad}
          />
        ))}
      </ul>
    </section>
  )
}

function ReelTile({
  permalink,
  featured,
  shouldLoad,
}: {
  permalink: string
  featured: boolean
  shouldLoad: boolean
}) {
  const embedUrl = `${permalink.replace(/\/$/, '')}/embed`
  const cellClasses = featured
    ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2'
    : ''

  return (
    <li className={cellClasses}>
      <div className="relative w-full aspect-[9/16] overflow-hidden border rule bg-bg/60">
        {shouldLoad ? (
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
        ) : (
          <a
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-bg/80 text-ink/40 font-mono tracking-mono uppercase text-[11px]"
            aria-label="Open reel on Instagram"
          >
            ▸ REEL
          </a>
        )}
      </div>
    </li>
  )
}
