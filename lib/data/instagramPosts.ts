/**
 * Hand-curated Instagram posts rendered in the home-page social grid.
 * Replace these permalinks with the real ones from
 *   https://www.instagram.com/a1.motor.park/
 * (each post's "…" menu → "Copy link" gives the canonical URL shape
 *  `https://www.instagram.com/p/<SHORTCODE>/` or `/reel/<SHORTCODE>/`).
 *
 * Order is preserved in the grid (first = top-left, flows L→R then top→bottom).
 * Recommend 4 or 6 entries for a clean layout.
 */

export type InstagramPost = {
  /** Permalink — must be a full https URL to a Post or Reel. */
  permalink: string
  /** Optional visible caption fallback shown while the embed loads. */
  caption?: string
  /**
   * Optional poster file (lives in `/public/social/`). When set, renders as a
   * square thumbnail in the profile grid. When missing, the tile falls back
   * to the dark brand gradient + reel glyph.
   */
  poster?: string
}

export const instagramPosts: InstagramPost[] = [
  { permalink: 'https://www.instagram.com/reel/DWlju3GDaJw/' },
  { permalink: 'https://www.instagram.com/reel/DXbTzALNMyx/' },
  { permalink: 'https://www.instagram.com/reel/DXYq_57NyT1/' },
  { permalink: 'https://www.instagram.com/reel/DXW7lG4Nl6N/' },
  { permalink: 'https://www.instagram.com/reel/DXWuspSiILJ/' },
]
