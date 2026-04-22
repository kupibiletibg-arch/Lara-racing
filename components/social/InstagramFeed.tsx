'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { instagramPosts, type InstagramPost } from '@/lib/data/instagramPosts'

/**
 * Hand-curated Instagram feed. Each reel renders as a **self-contained dark
 * card** with our own chrome — no IG iframe, no white chrome leak. Tiles
 * are equal size (9 : 16 aspect) arranged in a 1 / 2 / 3-column grid. The
 * whole card is a single outbound link to the reel permalink so a tap
 * anywhere opens it on Instagram in a new tab.
 *
 * A poster JPG sitting under /public/social/<shortcode>.jpg (set via
 * InstagramPost.poster or derived from the permalink) is shown behind a
 * brand-red play button. When no poster is available the card degrades to
 * a dark brand gradient with the same play button — still on-theme, still
 * the same size as the rest.
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

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {instagramPosts.map((post) => (
          <ReelCard key={post.permalink} post={post} />
        ))}
      </ul>
    </section>
  )
}

function ReelCard({ post }: { post: InstagramPost }) {
  const posterSrc = post.poster ? `/social/${post.poster}` : null

  return (
    <li>
      <a
        href={post.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-bg border rule overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        aria-label="Open reel on Instagram"
      >
        {/* Dark header */}
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

        {/* 9:16 poster panel with play overlay */}
        <div className="relative w-full aspect-[9/16] overflow-hidden bg-gradient-to-br from-brand-deep/30 via-bg to-bg">
          {posterSrc && (
            <Image
              src={posterSrc}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              // Posters may not exist yet — fail silently to the gradient.
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand/90 backdrop-blur-sm flex items-center justify-center shadow-[0_6px_24px_rgba(200,16,46,0.35)] transition-transform duration-300 group-hover:scale-110">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 md:h-6 md:w-6 fill-current text-ink ml-0.5"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dark footer */}
        <footer className="flex items-center justify-between gap-3 px-3 py-2.5 border-t rule">
          {typeof post.likes === 'number' ? (
            <span className="flex items-center gap-1.5 font-mono text-[12px] text-ink/80">
              <svg
                viewBox="0 0 24 24"
                className="h-[14px] w-[14px] text-brand"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 21s-7.5-4.5-9.5-10C1 7 4 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3 0 6 3 4.5 7-2 5.5-9.5 10-9.5 10z" />
              </svg>
              <span className="tabular-nums">{formatLikes(post.likes)}</span>
            </span>
          ) : (
            <span className="font-mono tracking-mono uppercase text-[10px] text-ink/40">
              @a1.motor.park
            </span>
          )}
          <span className="font-mono tracking-mono uppercase text-[10px] text-ink/60 group-hover:text-brand transition-colors">
            View on Instagram →
          </span>
        </footer>
      </a>
    </li>
  )
}

function formatLikes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}
