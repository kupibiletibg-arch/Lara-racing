/**
 * Posts rendered in the "What's up on socials" fan on the home page.
 *
 * Swap these out when real Instagram permalinks + portrait stills are
 * available. Until then:
 *
 * - `permalink: '#'` makes the card fall back to the profile URL (the
 *   SocialFan component handles the swap at render time).
 * - `poster: ''` renders a dark brand-gradient tile with an "A1" mark
 *   instead of `<Image />`, so we have a full fan of 6 cards even
 *   before all the stills are shot.
 * - Event posters from `/public/events/*.webp` are reused as temporary
 *   portrait-ish fillers; they're square (850×850) but read fine once
 *   rotated inside the fan.
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
    poster: '/events/bes-999-2026.webp',
    alt: 'BES 999 · 2026',
  },
  {
    permalink: '#',
    poster: '/events/bmw-cup-2026.webp',
    alt: 'BMW Cup · Round 1',
  },
  {
    permalink: '#',
    poster: '/events/premium-rally-2026-05.webp',
    alt: 'Premium Rally · May 2026',
  },
  {
    permalink: '#',
    poster: '/events/gd-racing-2026-04.webp',
    alt: 'GD Racing · April 2026',
  },
  {
    permalink: '#',
    poster: '',
    alt: 'A1 Motor Park',
  },
  {
    permalink: '#',
    poster: '',
    alt: 'Coming soon',
  },
]
