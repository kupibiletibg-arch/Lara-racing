'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { instagramPosts } from '@/lib/data/instagramPosts'

/**
 * Hand-curated Instagram feed with a **custom dark-themed chrome** around
 * each reel. Instagram's own /embed/ iframe ships a hard-coded light-theme
 * header (username + logo) and footer (likes + caption + view link) that
 * clash with our dark site. We can't restyle the iframe contents across
 * origins, but we can:
 *
 *   1. Clip the iframe vertically so only the video surface is visible
 *      (hide IG's ~54 px top chrome and ~84 px bottom chrome).
 *   2. Render our own dark header (@a1.motor.park chip) and footer
 *      (like count — manual, optional — and "View on Instagram →" link).
 *
 * The whole section is lazy-mounted via IntersectionObserver so the iframes
 * (and IG's native autoplay of the first in-view reel) fire as the user
 * scrolls into the section.
 */

const IG_TOP_CHROME_PX = 54
const IG_BOTTOM_CHROME_PX = 84

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
            likes={post.likes}
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
  likes,
  featured,
  shouldLoad,
}: {
  permalink: string
  likes?: number
  featured: boolean
  shouldLoad: boolean
}) {
  const embedUrl = `${permalink.replace(/\/$/, '')}/embed`
  const cellClasses = featured
    ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2'
    : ''

  return (
    <li className={cellClasses}>
      <article className="group flex flex-col bg-bg border rule overflow-hidden">
        {/* Dark header — mirrors IG's username strip without the light bg */}
        <header className="flex items-center gap-2.5 px-3 py-2.5 border-b rule">
          <div className="shrink-0 w-8 h-8 rounded-full bg-brand flex items-center justify-center font-mono text-[10px] font-bold text-ink">
            A1
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[12px] text-ink/90 truncate leading-tight">
              a1.motor.park
            </p>
            <p className="font-mono tracking-mono uppercase text-[9px] text-ink/40 leading-tight">
              Reel · A1 Motor Park
            </p>
          </div>
        </header>

        {/* Video surface — IG iframe clipped to hide its light chrome */}
        <div
          className="relative w-full bg-bg overflow-hidden"
          style={{ aspectRatio: '9 / 16' }}
        >
          {shouldLoad ? (
            <iframe
              src={embedUrl}
              title="Instagram reel"
              loading="lazy"
              scrolling="no"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute left-0 w-full border-0"
              style={{
                top: `-${IG_TOP_CHROME_PX}px`,
                height: `calc(100% + ${IG_TOP_CHROME_PX + IG_BOTTOM_CHROME_PX}px)`,
              }}
            />
          ) : (
            <a
              href={permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center text-ink/40 font-mono tracking-mono uppercase text-[11px]"
              aria-label="Open reel on Instagram"
            >
              ▸ REEL
            </a>
          )}
        </div>

        {/* Dark footer — likes + outbound link in our palette */}
        <footer className="flex items-center justify-between gap-3 px-3 py-2.5 border-t rule">
          {typeof likes === 'number' ? (
            <span className="flex items-center gap-1.5 font-mono text-[12px] text-ink/80">
              <svg
                viewBox="0 0 24 24"
                className="h-[14px] w-[14px] text-brand"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 21s-7.5-4.5-9.5-10C1 7 4 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3 0 6 3 4.5 7-2 5.5-9.5 10-9.5 10z" />
              </svg>
              <span className="tabular-nums">{formatLikes(likes)}</span>
            </span>
          ) : (
            <span className="font-mono tracking-mono uppercase text-[10px] text-ink/40">
              @a1.motor.park
            </span>
          )}
          <a
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono tracking-mono uppercase text-[10px] text-ink/60 hover:text-brand transition-colors"
          >
            View on Instagram →
          </a>
        </footer>
      </article>
    </li>
  )
}

function formatLikes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}
