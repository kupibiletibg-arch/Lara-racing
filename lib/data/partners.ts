export type Partner = {
  slug: string
  name: string
  /** Absolute URL (protocol included). Empty string = non-clickable tile. */
  url: string
  /** Path under /public. */
  logoSrc: string
  /** Alt text / accessible name. */
  alt: string
}

/**
 * A1 Motor Park partners. Real raster logos live under /public/partners.
 * URLs remain empty strings until supplied — the UI renders any tile
 * with `url === ''` as non-clickable.
 */
export const partners: readonly Partner[] = [
  {
    slug: 'kupibileti',
    name: 'kupibileti.bg',
    url: 'https://www.kupibileti.bg/bg/about-event/2292',
    logoSrc: '/partners/kupibileti.svg',
    alt: 'kupibileti.bg — ticketing partner',
  },
  {
    slug: 'pulse',
    name: 'Pulse',
    url: '',
    logoSrc: '/partners/pulse.png',
    alt: 'Pulse',
  },
  {
    slug: 'premium-rally',
    name: 'Premium Rally',
    url: 'https://premiumrally.com/',
    logoSrc: '/partners/premium-rally.png',
    alt: 'Premium Rally · Sofia – St. Vlas',
  },
  {
    slug: 'speed-sector',
    name: 'Speed Sector',
    url: 'https://www.facebook.com/SpeedSector/',
    logoSrc: '/partners/speed-sector.png',
    alt: 'Speed Sector',
  },
  {
    slug: 'rally-falcon',
    name: 'Rally Falcon',
    url: '',
    logoSrc: '/partners/rally-falcon.png',
    alt: 'Rally Falcon',
  },
  {
    slug: 'super-cars-run',
    name: 'Super Cars Run',
    url: '',
    logoSrc: '/partners/super-cars-run.png',
    alt: 'Super Cars Run',
  },
  {
    slug: 'margel',
    name: 'Margel',
    url: 'https://margel.info/bg/',
    logoSrc: '/partners/margel.png',
    alt: 'Margel',
  },
  {
    slug: 'red-zone',
    name: 'Red Zone',
    url: 'https://redzone.bg/',
    logoSrc: '/partners/red-zone.png',
    alt: 'Red Zone · VR Racing Lounge',
  },
  {
    slug: 'justpablo',
    name: '#JustPablo',
    url: 'https://www.instagram.com/justpablo_official/',
    logoSrc: '/partners/justpablo.png',
    alt: '#JustPablo',
  },
  {
    slug: 'gumi7',
    name: 'Gumi7.com',
    url: 'https://gumi7.com/bg/',
    logoSrc: '/partners/gumi7.png',
    alt: 'Gumi7.com',
  },
  {
    slug: 'mirafiori',
    name: 'Mirafiori Team',
    url: 'https://mirafiori.bg/',
    logoSrc: '/partners/mirafiori.png',
    alt: 'Mirafiori Team',
  },
  {
    slug: 'bmw-club',
    name: 'BMW Club Bulgaria',
    url: 'https://bmwpower-bg.net/',
    logoSrc: '/partners/bmw-club.png',
    alt: 'BMW Club Bulgaria',
  },
  {
    slug: 'endurance-999',
    name: 'Bulgarian Endurance Series 999',
    url: '',
    logoSrc: '/partners/endurance-999.png',
    alt: 'Bulgarian Endurance Series 999',
  },
  {
    slug: 'braid',
    name: 'BRAID',
    url: 'https://www.braid-wheels.com/',
    logoSrc: '/partners/braid.png',
    alt: 'BRAID · since 1976',
  },
] as const
