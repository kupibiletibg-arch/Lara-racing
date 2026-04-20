export type RaceType = 'ceremony' | 'public' | 'cars' | 'moto' | 'endurance'

export type Race = {
  id: string
  slug: string
  nameKey: string // i18n key under `events.*`
  type: RaceType
  dateLabel: string // display-ready, pre-formatted
  dateTBD?: boolean
  sessions?: Array<{ label: string; time: string }>
  // Position along the racing line, 0..1 (distance fraction along the path).
  // Hand-picked for v1 so events are visually distributed; swap for real
  // session-based positions once you have them.
  trackPosition: number
}

export const races: Race[] = [
  {
    id: '01',
    slug: 'opening',
    nameKey: 'opening',
    type: 'ceremony',
    dateLabel: '21.03.2026',
    sessions: [{ label: 'Ceremony', time: '14:00' }],
    trackPosition: 0.02,
  },
  {
    id: '02',
    slug: 'open-days',
    nameKey: 'openDays',
    type: 'public',
    dateLabel: '25.03 – 02.04.2026',
    sessions: [{ label: 'Gates open', time: '10:00' }],
    trackPosition: 0.14,
  },
  {
    id: '03',
    slug: 'endurance-999-r1',
    nameKey: 'endurance',
    type: 'endurance',
    dateLabel: '04.2026',
    dateTBD: true,
    sessions: [
      { label: 'FP', time: 'Fri' },
      { label: 'Q', time: 'Sat' },
      { label: '6h Race', time: 'Sun' },
    ],
    trackPosition: 0.26,
  },
  {
    id: '04',
    slug: 'bmw-cup-r1',
    nameKey: 'bmw1',
    type: 'cars',
    dateLabel: 'TBD',
    dateTBD: true,
    sessions: [
      { label: 'FP1', time: 'Fri' },
      { label: 'Q', time: 'Sat' },
      { label: 'R1 / R2', time: 'Sun' },
    ],
    trackPosition: 0.4,
  },
  {
    id: '05',
    slug: 'gs-motodays',
    nameKey: 'gs',
    type: 'moto',
    dateLabel: 'TBD',
    dateTBD: true,
    sessions: [{ label: 'Track day', time: 'All day' }],
    trackPosition: 0.54,
  },
  {
    id: '06',
    slug: 'sr-track-days',
    nameKey: 'sr',
    type: 'moto',
    dateLabel: 'TBD',
    dateTBD: true,
    sessions: [{ label: 'Track day', time: 'All day' }],
    trackPosition: 0.66,
  },
  {
    id: '07',
    slug: 'bmw-cup-r2',
    nameKey: 'bmw2',
    type: 'cars',
    dateLabel: 'TBD',
    dateTBD: true,
    sessions: [
      { label: 'FP1', time: 'Fri' },
      { label: 'Q', time: 'Sat' },
      { label: 'R1 / R2', time: 'Sun' },
    ],
    trackPosition: 0.8,
  },
  {
    id: '08',
    slug: 'alpe-adria-finale',
    nameKey: 'alpeadria',
    type: 'moto',
    dateLabel: '10.2026',
    dateTBD: true,
    sessions: [
      { label: 'FP', time: 'Fri' },
      { label: 'Q', time: 'Sat' },
      { label: 'Races', time: 'Sun' },
    ],
    trackPosition: 0.94,
  },
]
