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
  /** Optional manual like count shown in the custom dark footer. */
  likes?: number
  /**
   * Optional filename under /public/social/ (e.g. "DWlju3GDaJw.jpg").
   * When present the tile renders the poster behind a play-icon overlay;
   * otherwise the tile falls back to a branded gradient placeholder.
   * IG's public pages no longer expose og:image without auth, so posters
   * have to be saved manually (screenshot each reel's first frame,
   * drop into public/social/).
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
