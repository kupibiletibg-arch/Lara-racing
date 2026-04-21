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
    titleBg: 'GD Racing — GT Track Day',
    titleEn: 'GD Racing — GT Track Day',
    dateLabel: '18–19 април 2026',
    kicker: 'GT · АФБ · 1-ви кръг',
    image: '/events/gd-racing-2026-04.webp',
    ticketUrl: 'https://www.kupibileti.bg/bg/category/301',
  },
  {
    id: 'bmw-cup-2026-r1',
    slug: 'bmw-cup-2026-r1',
    titleBg: 'BMW CUP 2026 — 1-ви кръг',
    titleEn: 'BMW CUP 2026 — Round 1',
    dateLabel: '3–4 април 2026',
    kicker: 'BMW CUP · CIRCUIT',
    image: '/events/bmw-cup-2026.webp',
    ticketUrl: 'https://www.kupibileti.bg/bg/category/301',
  },
]
