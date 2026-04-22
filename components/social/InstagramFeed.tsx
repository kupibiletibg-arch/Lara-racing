'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { instagramPosts } from '@/lib/data/instagramPosts'

/**
 * Social section on the home page, rendered as an Instagram-profile feed:
 *   - `ProfileHeader`: avatar, username, stats row, display name, bio
 *   - `TabBar`:        IG-style 3-icon bar with the grid tab active
 *   - `ProfileGrid`:   3-column tiles of reels that render IG's own
 *                      `/reel/<SHORTCODE>/embed/` iframe inline, so each
 *                      tile shows the real thumbnail and plays in place
 *                      when the viewer taps the play button.
 */
export function InstagramFeed() {
  const t = useTranslations('social')

  if (instagramPosts.length === 0) return null

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-24 border-t rule">
      {/* Section lead-in */}
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

      {/* IG-profile card */}
      <div className="mx-auto max-w-[980px] border rule bg-bg/40">
        <ProfileHeader />
        <TabBar />
        <ProfileGrid />
      </div>
    </section>
  )
}

/* ───────────────────────────── Profile header ─────────────────────────── */

function ProfileHeader() {
  const t = useTranslations('social.profile')

  return (
    <div className="p-6 md:p-8 flex items-start gap-6 md:gap-10">
      {/* Avatar — brand disc on a subtle ring */}
      <div className="shrink-0 relative">
        <div className="w-[84px] h-[84px] md:w-[120px] md:h-[120px] rounded-full bg-brand/15 p-[3px] ring-1 ring-ink/10">
          <div className="w-full h-full rounded-full bg-bg flex items-center justify-center overflow-hidden">
            <Image
              src="/brand/a1-motor-park-logo.png"
              alt="A1 Motor Park"
              width={96}
              height={96}
              className="object-contain w-[70%] h-[70%]"
              priority={false}
            />
          </div>
        </div>
      </div>

      {/* Identity column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-display font-bold text-[20px] md:text-[22px] tracking-tight">
            a1.motor.park
          </h3>
          <a
            href="https://www.instagram.com/a1.motor.park/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono tracking-mono uppercase text-[10px] md:text-[11px] px-3 py-1 border rule text-ink/80 hover:bg-ink/5 transition-colors"
          >
            {t('follow')}
          </a>
        </div>

        {/* Stats row */}
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[12px] md:text-[13px] text-ink/80">
          <li>{t('posts')}</li>
          <li>{t('followers')}</li>
          <li>{t('following')}</li>
        </ul>

        {/* Display name + bio */}
        <p className="mt-3 font-display font-bold text-[13px] md:text-[14px]">
          {t('displayName')}
        </p>
        <p className="mt-1 text-ink/80 text-[12px] md:text-[13px] leading-relaxed max-w-prose whitespace-pre-line">
          {t('bio')}
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────────── Tab bar ────────────────────────────────── */

function TabBar() {
  const t = useTranslations('social.profile.tabs')
  return (
    <div className="border-t rule">
      <ul className="flex items-center justify-center gap-10 md:gap-20">
        <TabButton active label={t('grid')}>
          <GridIcon />
        </TabButton>
        <TabButton label={t('reels')}>
          <ReelsIcon />
        </TabButton>
        <TabButton label={t('tagged')}>
          <TaggedIcon />
        </TabButton>
      </ul>
    </div>
  )
}

function TabButton({
  active,
  label,
  children,
}: {
  active?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <li
      className={`relative py-3 flex items-center gap-2 font-mono tracking-mono uppercase text-[10px] md:text-[11px] ${
        active ? 'text-ink' : 'text-ink/50'
      }`}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
      {active && (
        <span className="absolute left-0 right-0 top-0 h-px bg-ink" />
      )}
    </li>
  )
}

/* ───────────────────────────── Profile grid ───────────────────────────── */

function ProfileGrid() {
  // Section is capped at 3 reels — one full row in the 3-col grid, matching
  // IG's first-row-above-the-fold feel without scrolling a big grid of
  // iframes.
  const visiblePosts = instagramPosts.slice(0, 3)
  return (
    <ul className="grid grid-cols-3 gap-[3px] p-[3px] bg-ink/5">
      {visiblePosts.map((p) => (
        <ReelTile key={p.permalink} permalink={p.permalink} />
      ))}
    </ul>
  )
}

/**
 * One grid cell. We host the `/reel/<CODE>/embed/` iframe in an
 * aspect-[9/16] wrapper so IG's own thumbnail + play button are what the
 * viewer sees. Tapping the play button starts playback inline — the `allow`
 * attrs are what unlock that for autoplay / fullscreen / PiP.
 */
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

/* ───────────────────────────── Icons ──────────────────────────────────── */

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function ReelsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 8h18M8 3l3 5M16 3l3 5" strokeLinejoin="round" />
      <path d="M10 12l5 3-5 3v-6z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TaggedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path d="M4 21v-2a5 5 0 015-5h3M17 11a4 4 0 100-8 4 4 0 000 8zM9 7a3 3 0 106 0 3 3 0 00-6 0" />
      <path d="M17 14v6M14 17h6" strokeLinecap="round" />
    </svg>
  )
}
