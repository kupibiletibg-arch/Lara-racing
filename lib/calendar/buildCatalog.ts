import { races } from '@/lib/data/races'
import { pastEvents } from '@/lib/data/pastEvents'
import { upcomingEvents } from '@/lib/data/upcomingEvents'
import { parseLoose } from './formatDateRange'

export type CatalogCategory =
  | 'ceremony'
  | 'public'
  | 'cars'
  | 'moto'
  | 'endurance'
  | 'rally'
  | 'supercars'

export type CatalogSource = 'race' | 'upcoming' | 'past'

export type CatalogEvent = {
  id: string
  slug: string
  /** i18n key under `events.*` (races). When set it takes precedence over titleBg/titleEn. */
  nameKey?: string
  titleBg?: string
  titleEn?: string
  kicker?: string
  category: CatalogCategory
  /** i18n key under `eventType.*` used for the chip label on Race-sourced entries. */
  typeKey?: string
  dateLabel: string
  dateTBD?: boolean
  startDate?: Date
  endDate?: Date
  image?: string
  ticketUrl?: string
  /** Internal detail route for Race-sourced entries only. */
  detailHref?: string
  /** Where this entry came from — useful for the "upcoming/past" filter fallback. */
  source: CatalogSource
}

function categorizeKicker(kicker: string | undefined): CatalogCategory {
  if (!kicker) return 'cars'
  const k = kicker.toLowerCase()
  if (k.includes('rally')) return 'rally'
  if (k.includes('supercar')) return 'supercars'
  if (k.includes('endur') || k.includes('издр')) return 'endurance'
  if (k.includes('moto') || k.includes('мото')) return 'moto'
  if (k.includes('cup') || k.includes('gt') || k.includes('cars')) return 'cars'
  if (k.includes('ceremon') || k.includes('церемон')) return 'ceremony'
  if (k.includes('public') || k.includes('публич')) return 'public'
  return 'cars'
}

/**
 * Normalize the three event data sources into a single catalog. Races provide
 * the i18n-driven season programme; past/upcoming posters provide richer
 * cover art for a subset. Entries are deduped by slug — a poster with the
 * same slug as a race supplies the image and ticket link to that race entry.
 */
export function buildCatalog(): CatalogEvent[] {
  const bySlug = new Map<string, CatalogEvent>()

  // Seed from races — the authoritative season list.
  for (const r of races) {
    const { start, end, tbd } = parseLoose(r.dateLabel)
    bySlug.set(r.slug, {
      id: r.id,
      slug: r.slug,
      nameKey: r.nameKey,
      category: r.type as CatalogCategory,
      typeKey: r.type,
      dateLabel: r.dateLabel,
      dateTBD: Boolean(r.dateTBD) || tbd,
      startDate: start,
      endDate: end,
      detailHref: `/events/${r.slug}`,
      source: 'race',
    })
  }

  // Overlay upcoming posters — these add image/ticket + explicit bilingual title.
  for (const u of upcomingEvents) {
    const { start, end, tbd } = parseLoose(u.dateLabel)
    const existing = bySlug.get(u.slug)
    const merged: CatalogEvent = {
      id: existing?.id ?? u.id,
      slug: u.slug,
      nameKey: existing?.nameKey,
      titleBg: u.titleBg,
      titleEn: u.titleEn,
      kicker: u.kicker,
      category: existing?.category ?? categorizeKicker(u.kicker),
      typeKey: existing?.typeKey,
      dateLabel: u.dateLabel,
      dateTBD: Boolean(existing?.dateTBD && tbd),
      startDate: start ?? existing?.startDate,
      endDate: end ?? existing?.endDate,
      image: u.image,
      ticketUrl: u.ticketUrl,
      detailHref: existing?.detailHref,
      source: 'upcoming',
    }
    bySlug.set(u.slug, merged)
  }

  // Overlay past posters.
  for (const p of pastEvents) {
    const { start, end } = parseLoose(p.dateLabel)
    const existing = bySlug.get(p.slug)
    const merged: CatalogEvent = {
      id: existing?.id ?? p.id,
      slug: p.slug,
      nameKey: existing?.nameKey,
      titleBg: p.titleBg,
      titleEn: p.titleEn,
      kicker: p.kicker,
      category: existing?.category ?? categorizeKicker(p.kicker),
      typeKey: existing?.typeKey,
      dateLabel: p.dateLabel,
      dateTBD: false,
      startDate: start ?? existing?.startDate,
      endDate: end ?? existing?.endDate,
      image: p.image,
      ticketUrl: p.ticketUrl,
      detailHref: existing?.detailHref,
      source: 'past',
    }
    bySlug.set(p.slug, merged)
  }

  return Array.from(bySlug.values())
}

/**
 * Sort a catalog chronologically — earliest start first, TBDs last.
 */
export function sortCatalog(list: CatalogEvent[]): CatalogEvent[] {
  return [...list].sort((a, b) => {
    const aT = a.startDate?.getTime() ?? Number.POSITIVE_INFINITY
    const bT = b.startDate?.getTime() ?? Number.POSITIVE_INFINITY
    return aT - bT
  })
}
