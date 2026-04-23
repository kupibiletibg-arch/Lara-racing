'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { socialPosts, type SocialPost } from '@/lib/data/socialPosts'

const IG_HREF = 'https://www.instagram.com/a1.motor.park/'

/**
 * "What's up on socials" — a fan-of-cards showcase styled after the
 * matching section at landonorris.com. Six portrait cards spread out
 * in an arc from the bottom of the container; outer cards rotate
 * further and drop lower, the middle two stay nearly upright, just
 * like a hand of playing cards.
 *
 * Per-card geometry derives purely from the card's index so the
 * render stays stateless: `offset = i - (total - 1) / 2` places card
 * zero on the far left and the last card on the far right; rotation
 * scales linearly with offset, the vertical drop uses a slightly
 * super-linear curve (`|offset| ** 1.35`) so the spread reads more
 * like a curved arc than a straight slant.
 *
 * Hover behaviour (same pattern as Lando's site):
 *   1. The hovered card lifts ~60 px up, fully straightens (rotate
 *      lerped toward 0), scales to 1.08, and its shadow deepens.
 *   2. All other cards dim to 55 % opacity while the fan is hovered,
 *      so the focussed card pops even if it was half-covered by a
 *      neighbour. Self-hover overrides the dim back to 100 %.
 *   3. Transition uses a soft cubic-bezier so the lift has a small
 *      overshoot / settle feel instead of a linear slide.
 */
export function SocialFan() {
  const t = useTranslations('social')
  const total = socialPosts.length

  return (
    <section
      aria-label={t('title')}
      className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-24 border-t rule"
    >
      <div className="text-center">
        <p className="telemetry mb-3">{t('kicker')}</p>
        <h2 className="font-display font-bold text-[36px] md:text-[56px] leading-tight tracking-tight">
          {t('title')}
        </h2>
      </div>

      {/* `group/fan` lets each FanCard ask "is ANY of my siblings
          hovered?" via `group-hover/fan:*` utilities, so we can dim
          the rest of the stack while the focussed card pops. */}
      <div className="group/fan relative mt-10 md:mt-16 h-[380px] md:h-[520px] flex items-end justify-center">
        {socialPosts.map((post, i) => (
          <FanCard key={i} post={post} index={i} total={total} />
        ))}
      </div>

      <div className="text-center mt-8 md:mt-12">
        <p className="text-ink/75 text-[14px] md:text-[15px] mb-3">
          {t('subtitle')}
        </p>
        <a
          href={IG_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-mono tracking-mono uppercase text-[11px] text-ink/70 hover:text-brand transition-colors border-b rule pb-1"
        >
          {t('cta')} →
        </a>
      </div>
    </section>
  )
}

/* ────────────────────────────── FanCard ────────────────────────────── */

function FanCard({
  post,
  index,
  total,
}: {
  post: SocialPost
  index: number
  total: number
}) {
  // Symmetric offset: for total=6 → -2.5, -1.5, -0.5, 0.5, 1.5, 2.5
  const offset = index - (total - 1) / 2
  const abs = Math.abs(offset)

  // Resting pose — matches the Lando reference silhouette. xShift/yShift/
  // rotate scale with `offset`, so the fan auto-adjusts if we ever change
  // the number of posts.
  const rotate = offset * 8 // deg
  const xShift = offset * 52 // px — horizontal spread
  const yShift = Math.pow(abs, 1.35) * 12 // px — outer cards drop further
  const zIndex = 10 - Math.round(abs)

  // Hover pose — lift the card clear of its neighbours, straighten the
  // rotation to 0 (same as Lando's version), and scale up to 1.08 so it
  // visibly grows even if another card was overlapping half of it.
  const hoverYShift = -64 // lift 64 px above the resting baseline
  const hoverRotate = 0 // fully straight on hover
  const hoverScale = 1.08

  // Clicks gracefully fall back to the profile URL until a real
  // permalink is supplied.
  const href =
    post.permalink && post.permalink !== '#' ? post.permalink : IG_HREF

  // Both poses live in CSS custom properties so the inline `transform`
  // (which would otherwise override Tailwind's hover utilities) can
  // swap them atomically via the `:hover` / `:focus-visible` pseudo-
  // classes. Transition targets `transform`, `opacity`, and
  // `box-shadow` together with a soft cubic-bezier for an elastic-
  // looking settle.
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={post.alt}
      className={[
        'absolute block',
        'w-[140px] md:w-[220px] aspect-[9/16]',
        'rounded-[22px] overflow-hidden',
        'ring-1 ring-white/10',
        'shadow-[0_20px_40px_rgba(0,0,0,0.5)]',
        'bg-[#0a0a0a]',
        // Smooth cubic-bezier motion on all visual props at once.
        'transition-[transform,box-shadow,opacity] duration-[400ms]',
        '[transition-timing-function:cubic-bezier(.22,1,.36,1)]',
        // Siblings fade when ANY card in the fan is hovered, so the
        // focussed card pops against the rest of the stack.
        'group-hover/fan:opacity-55',
        // Self-hover / keyboard focus: cancel the dim, rise above
        // every z-index, swap in the hover transform, deepen shadow.
        'hover:!opacity-100 hover:z-50 hover:shadow-[0_34px_70px_rgba(0,0,0,0.65)]',
        'hover:[transform:var(--fan-transform-hover)]',
        'focus-visible:!opacity-100 focus-visible:z-50',
        'focus-visible:[transform:var(--fan-transform-hover)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
      ].join(' ')}
      style={{
        ['--fan-transform' as string]: `translate(${xShift}px, ${yShift}px) rotate(${rotate}deg)`,
        ['--fan-transform-hover' as string]: `translate(${xShift}px, ${hoverYShift}px) rotate(${hoverRotate}deg) scale(${hoverScale})`,
        transform: 'var(--fan-transform)',
        zIndex,
      }}
    >
      {post.poster ? (
        <Image
          src={post.poster}
          alt={post.alt}
          fill
          sizes="(max-width: 768px) 140px, 220px"
          className="object-cover"
          priority={false}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a0707] text-ink/25 font-display font-bold text-[40px] md:text-[56px] tracking-tight"
        >
          A1
        </span>
      )}
    </a>
  )
}
