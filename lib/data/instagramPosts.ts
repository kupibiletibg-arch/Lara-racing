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
}

export const instagramPosts: InstagramPost[] = [
  // TODO: replace with real permalinks from @a1.motor.park
  { permalink: 'https://www.instagram.com/a1.motor.park/', caption: 'A1 Motor Park' },
]
