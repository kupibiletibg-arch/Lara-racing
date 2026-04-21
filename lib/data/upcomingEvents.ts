export type UpcomingEvent = {
  id: string
  slug: string
  titleBg: string
  titleEn: string
  dateLabel: string
  kicker: string
  image: string
  ticketUrl?: string
}

export const upcomingEvents: UpcomingEvent[] = [
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
