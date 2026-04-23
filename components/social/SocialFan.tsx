'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { socialPosts, type SocialPost } from '@/lib/data/socialPosts'

const IG_HREF = 'https://www.instagram.com/a1.motor.park/'

// Horizontal distance (in px) between the resting centres of two
// adjacent cards. Kept in module scope because both the FanCard
// geometry and the pointer-to-index math need the same number.
const CARD_STEP = 52

/**
 * "What's up on socials" — a fan-of-cards showcase styled after the
 * matching section at landonorris.com. Six portrait cards spread out
 * in an arc from the bottom of the container; outer cards rotate
 * further and drop lower, the middle two stay nearly upright, just
 * like a hand of playing cards.
 *
 * The fan uses Pointer Events on the container — one unified handler
 * powers both desktop mouse hover and mobile horizontal swipe:
 *   - As the cursor / finger moves across the fan, we compute which
 *     card sits nearest to that X position and promote it to the
 *     `active` state.
 *   - The active card lifts out of the stack, straightens and scales;
 *     every other card dims to 55 % so the promoted one reads clearly
 *     even when it was half-covered by a neighbour.
 *   - `touch-action: pan-y` on the fan wrapper keeps vertical page
 *     scroll working on phones while horizontal drags stay captured
 *     by the pointer-move handler.
 */
export function SocialFan() {
  const t = useTranslations('social')
  const total = socialPosts.length
  const fanRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  // Map a viewport X coordinate to the index of the card nearest to
  // that position, or `null` when the pointer leaves the fan.
  const pickActive = (clientX: number) => {
    const el = fanRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = clientX - (rect.left + rect.width / 2)
    // offset(i) = i - (total - 1) / 2, so i = offset + (total - 1) / 2
    const rawIdx = Math.round(relX / CARD_STEP + (total - 1) / 2)
    const clamped = Math.max(0, Math.min(total - 1, rawIdx))
    setActiveIdx(clamped)
  }

  const clearActive = () => setActiveIdx(null)

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

      <div
        ref={fanRef}
        onPointerMove={(e) => pickActive(e.clientX)}
        onPointerLeave={clearActive}
        onPointerCancel={clearActive}
        className="relative mt-10 md:mt-16 h-[380px] md:h-[520px] flex items-end justify-center touch-pan-y"
      >
        {socialPosts.map((post, i) => (
          <FanCard
            key={i}
            post={post}
            index={i}
            total={total}
            active={activeIdx === i}
            anyActive={activeIdx !== null}
          />
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
  active,
  anyActive,
}: {
  post: SocialPost
  index: number
  total: number
  active: boolean
  anyActive: boolean
}) {
  // Symmetric offset: for total=6 → -2.5, -1.5, -0.5, 0.5, 1.5, 2.5
  const offset = index - (total - 1) / 2
  const abs = Math.abs(offset)

  // Resting pose — matches the Lando reference silhouette.
  const rotate = offset * 8 // deg
  const xShift = offset * CARD_STEP // px — horizontal spread
  const yShift = Math.pow(abs, 1.35) * 12 // px — outer cards drop further
  const baseZ = 10 - Math.round(abs)

  // Active pose — lift clear of the stack, straighten, scale up.
  const activeYShift = -64
  const activeRotate = 0
  const activeScale = 1.08

  const resting = `translate(${xShift}px, ${yShift}px) rotate(${rotate}deg)`
  const lifted = `translate(${xShift}px, ${activeYShift}px) rotate(${activeRotate}deg) scale(${activeScale})`

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
      aria-current={active || undefined}
      className={[
        'absolute block',
        'w-[140px] md:w-[220px] aspect-[9/16]',
        'rounded-[22px] overflow-hidden',
        'ring-1 ring-white/10',
        'bg-[#0a0a0a]',
        // Unified transition for all the properties that change between
        // the resting and lifted poses. Cubic-bezier gives a soft
        // settle instead of a linear slide.
        'transition-[transform,box-shadow,opacity] duration-[400ms]',
        '[transition-timing-function:cubic-bezier(.22,1,.36,1)]',
        // Keyboard focus mirrors the pointer-active pose so keyboard
        // users get the same reveal.
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        // Deep shadow when lifted, subtle shadow at rest.
        active
          ? 'shadow-[0_34px_70px_rgba(0,0,0,0.65)]'
          : 'shadow-[0_20px_40px_rgba(0,0,0,0.5)]',
        // Dim all non-active cards while another card is in focus.
        anyActive && !active ? 'opacity-55' : 'opacity-100',
      ].join(' ')}
      style={{
        transform: active ? lifted : resting,
        // Lifted card always tops every neighbour; resting cards keep
        // their natural stack order based on distance from centre.
        zIndex: active ? 50 : baseZ,
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
