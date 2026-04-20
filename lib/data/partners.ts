export type Partner = {
  slug: string
  name: string
  /** Absolute URL (protocol included). Leave empty `''` until provided. */
  url: string
  /** Path under /public. Swap to a real file when available. */
  logoSrc: string
  /** Alt text / accessible name. */
  alt: string
}

const PLACEHOLDER = '/partners/_placeholder.svg'

/**
 * A1 Motor Park partners. Logo paths currently point to a placeholder SVG
 * until individual logo files are supplied. URLs are empty strings for now
 * and should be filled in when available — the UI treats an empty `url` as
 * non-clickable.
 */
export const partners: readonly Partner[] = [
  {
    slug: 'pulse',
    name: 'Pulse',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: 'Pulse',
  },
  {
    slug: 'premium-rally',
    name: 'Premium Rally',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: 'Premium Rally · Sofia – St. Vlas',
  },
  {
    slug: 'speed-sector',
    name: 'Speed Sector',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: 'Speed Sector',
  },
  {
    slug: 'rally-falcon',
    name: 'Rally Falcon',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: 'Rally Falcon',
  },
  {
    slug: 'super-cars-run',
    name: 'Super Cars Run',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: 'Super Cars Run',
  },
  {
    slug: 'margel',
    name: 'Margel',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: 'Margel',
  },
  {
    slug: 'red-zone',
    name: 'Red Zone',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: 'Red Zone · VR Racing Lounge',
  },
  {
    slug: 'justpablo',
    name: '#JustPablo',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: '#JustPablo',
  },
  {
    slug: 'gumi7',
    name: 'Gumi7.com',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: 'Gumi7.com',
  },
  {
    slug: 'mirafiori',
    name: 'Mirafiori Team',
    url: '',
    logoSrc: PLACEHOLDER,
    alt: 'Mirafiori Team',
  },
] as const
