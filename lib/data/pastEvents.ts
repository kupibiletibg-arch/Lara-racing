export type PastEvent = {
  id: string
  slug: string
  titleBg: string
  titleEn: string
  dateLabel: string
  kicker: string // e.g. "GT · СЪСТЕЗАНИЕ" / "RALLY"
  image: string // public path, .webp
  ticketUrl?: string // kupibileti.bg or similar
}

export const pastEvents: PastEvent[] = [
  {
    id: 'gd-racing-2026-04',
    slug: 'gd-racing-2026-04',
    titleBg: 'GD Racing by Georgi Donchev',
    titleEn: 'GD Racing by Georgi Donchev',
    dateLabel: '18–19 април 2026',
    kicker: 'GT · TRACK DAY',
    image: '/events/gd-racing-2026-04.webp',
    ticketUrl: 'https://www.kupibileti.bg/bg/category/301',
  },
  {
    id: 'premium-rally-2026-05',
    slug: 'premium-rally-2026-05',
    titleBg: 'Premium Rally Sofia – St. Vlas',
    titleEn: 'Premium Rally Sofia – St. Vlas',
    dateLabel: '1 май 2026',
    kicker: 'RALLY · SUPERCARS',
    image: '/events/premium-rally-2026-05.webp',
    ticketUrl: 'https://www.kupibileti.bg/bg/about-event/2292',
  },
]
