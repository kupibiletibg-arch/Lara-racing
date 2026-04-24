/**
 * Posts rendered in the "What's up on socials" fan on the home page.
 *
 * Six A1-branded portrait stills live under `/public/social/` — each
 * pre-cropped to 9:16, resized to the native crop (540×960 … 977×1736)
 * and encoded as WebP at quality 85, totalling ~390 KB for the full
 * fan. When real Instagram permalinks land for these posts, swap each
 * entry's `permalink` from `'#'` (which falls back to the profile URL
 * inside <SocialFan />) to the post's https URL.
 *
 * Fallback paths still exist for future slots: setting `poster: ''`
 * renders a dark brand-gradient tile with an "A1" mark so the fan
 * never shows a broken image even when awaiting content.
 */
export type SocialPost = {
  /** Full https URL to the IG post/reel, or `'#'` for the placeholder state. */
  permalink: string
  /** Path served from `/public`. Empty string → brand-gradient fallback. */
  poster: string
  /** Short accessible label for the card. */
  alt: string
}

export const socialPosts: SocialPost[] = [
  {
    permalink: '#',
    poster: '/social/bmw-m4-gt4.webp',
    alt: 'BMW M4 GT4',
  },
  {
    permalink: '#',
    poster: '/social/abt-lamborghini.webp',
    alt: 'ABT Lamborghini',
  },
  {
    permalink: '#',
    poster: '/social/porsche-918.webp',
    alt: 'Porsche 918',
  },
  {
    permalink: '#',
    poster: '/social/ferrari-296.webp',
    alt: 'Ferrari 296 Challenge',
  },
  {
    permalink: '#',
    poster: '/social/est25.webp',
    alt: 'A1 Motor Park · EST 2025',
  },
  {
    permalink: '#',
    poster: '/social/hero-shot.webp',
    alt: 'A1 Motor Park · hero shot',
  },
]
