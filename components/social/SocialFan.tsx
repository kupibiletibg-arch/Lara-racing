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

      <div className="relative mt-10 md:mt-16 h-[380px] md:h-[520px] flex items-end justify-center">
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

  // Single transform numbers that read well at both the mobile
  // (140 px card) and desktop (220 px card) sizes — the ratio of
  // xShift to card width lands around 30 % in both cases, giving
  // the same visual overlap density at either breakpoint.
  const rotate = offset * 8 // deg
  const xShift = offset * 52 // px — horizontal spread
  const yShift = Math.pow(abs, 1.35) * 12 // px — outer cards drop further
  const zIndex = 10 - Math.round(abs)

  // Clicks gracefully fall back to the profile URL until a real
  // permalink is supplied.
  const href =
    post.permalink && post.permalink !== '#' ? post.permalink : IG_HREF

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={post.alt}
      className="absolute block w-[140px] md:w-[220px] aspect-[9/16] rounded-[22px] overflow-hidden ring-1 ring-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-[#0a0a0a] transition-transform duration-300 ease-out hover:z-50 hover:scale-[1.04] focus-visible:z-50 focus-visible:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      style={{
        transform: `translate(${xShift}px, ${yShift}px) rotate(${rotate}deg)`,
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
