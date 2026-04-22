// Best-effort parser for the loose Bulgarian/English date labels we store
// alongside each event. Input formats we care about:
//   "21.03.2026"                 → single day
//   "25.03 – 02.04.2026"         → DD.MM – DD.MM.YYYY range
//   "03.04 – 04.04.2026"         → same-month range
//   "18–19 април 2026"           → BG day range + month name + year
//   "1 май 2026"                 → BG single day
//   "April 18–19 2026"           → EN day range + month + year
//   "10.2026"                    → month-only
//   "04.2026"                    → month-only
//   "TBD" | "" | unknown         → no parse, tbd=true

export type LooseDate = {
  start?: Date
  end?: Date
  tbd: boolean
}

const BG_MONTHS: Record<string, number> = {
  януари: 0, февруари: 1, март: 2, април: 3, май: 4, юни: 5,
  юли: 6, август: 7, септември: 8, октомври: 9, ноември: 10, декември: 11,
}

const EN_MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8,
  oct: 9, nov: 10, dec: 11,
}

function mkDate(y: number, m: number, d: number) {
  // Construct in UTC to avoid off-by-one from local timezone
  return new Date(Date.UTC(y, m, d))
}

function parseNumericRange(label: string): LooseDate | null {
  // Patterns: "DD.MM.YYYY", "DD.MM – DD.MM.YYYY", "MM.YYYY"
  const clean = label.replace(/\s+/g, '').replace(/–|—/g, '-')

  // Month-only "04.2026"
  const monthOnly = /^(\d{1,2})\.(\d{4})$/.exec(clean)
  if (monthOnly) {
    const m = parseInt(monthOnly[1], 10) - 1
    const y = parseInt(monthOnly[2], 10)
    return { start: mkDate(y, m, 1), end: mkDate(y, m, 1), tbd: false }
  }

  // Range "DD.MM-DD.MM.YYYY"
  const range = /^(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(clean)
  if (range) {
    const sd = parseInt(range[1], 10)
    const sm = parseInt(range[2], 10) - 1
    const ed = parseInt(range[3], 10)
    const em = parseInt(range[4], 10) - 1
    const y = parseInt(range[5], 10)
    return { start: mkDate(y, sm, sd), end: mkDate(y, em, ed), tbd: false }
  }

  // Single "DD.MM.YYYY"
  const single = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(clean)
  if (single) {
    const d = parseInt(single[1], 10)
    const m = parseInt(single[2], 10) - 1
    const y = parseInt(single[3], 10)
    return { start: mkDate(y, m, d), end: mkDate(y, m, d), tbd: false }
  }

  return null
}

function parseNamedMonth(label: string): LooseDate | null {
  // Examples:
  //   "18–19 април 2026"       → bg
  //   "1 май 2026"              → bg
  //   "April 18–19 2026"        → en "Month DD[–DD] YYYY"
  //   "April 1 2026"            → en
  const normalized = label.replace(/–|—/g, '-').replace(/\s+/g, ' ').trim().toLowerCase()

  // BG form: "DD[-DD] <monthName> YYYY"
  const bg = /^(\d{1,2})(?:-(\d{1,2}))?\s+([а-яё]+)\s+(\d{4})$/i.exec(normalized)
  if (bg && BG_MONTHS[bg[3]] !== undefined) {
    const sd = parseInt(bg[1], 10)
    const ed = bg[2] ? parseInt(bg[2], 10) : sd
    const m = BG_MONTHS[bg[3]]
    const y = parseInt(bg[4], 10)
    return { start: mkDate(y, m, sd), end: mkDate(y, m, ed), tbd: false }
  }

  // EN form: "<monthName> DD[-DD] YYYY"
  const en = /^([a-z]+)\s+(\d{1,2})(?:-(\d{1,2}))?\s+(\d{4})$/i.exec(normalized)
  if (en && EN_MONTHS[en[1]] !== undefined) {
    const m = EN_MONTHS[en[1]]
    const sd = parseInt(en[2], 10)
    const ed = en[3] ? parseInt(en[3], 10) : sd
    const y = parseInt(en[4], 10)
    return { start: mkDate(y, m, sd), end: mkDate(y, m, ed), tbd: false }
  }

  return null
}

export function parseLoose(label: string | undefined): LooseDate {
  if (!label) return { tbd: true }
  const trimmed = label.trim()
  if (!trimmed || /^tbd$/i.test(trimmed)) return { tbd: true }
  return parseNumericRange(trimmed) ?? parseNamedMonth(trimmed) ?? { tbd: true }
}

export type DateStamp = { line1: string; line2: string }

/**
 * Visual short stamp for the poster overlay:
 *   { line1: '18–19', line2: 'АПР' }  or  { line1: '03', line2: 'АПР' }
 */
export function formatShortStamp(
  start: Date | undefined,
  end: Date | undefined,
  locale: 'bg' | 'en',
): DateStamp | null {
  if (!start) return null
  const sd = start.getUTCDate()
  const ed = end ? end.getUTCDate() : sd
  const sm = start.getUTCMonth()
  const em = end ? end.getUTCMonth() : sm

  const monthName = new Intl.DateTimeFormat(locale === 'bg' ? 'bg-BG' : 'en-GB', {
    month: 'short',
    timeZone: 'UTC',
  })
    .format(start)
    .toUpperCase()
    .replace('.', '')

  const sameMonth = sm === em
  const line1 =
    sd === ed
      ? String(sd).padStart(2, '0')
      : sameMonth
        ? `${sd}–${ed}`
        : `${sd}.${String(sm + 1).padStart(2, '0')}–${ed}.${String(em + 1).padStart(2, '0')}`
  return { line1, line2: monthName }
}

/** Month key suitable for the URL filter: "01".."12". */
export function monthKey(d: Date | undefined): string | null {
  if (!d) return null
  return String(d.getUTCMonth() + 1).padStart(2, '0')
}

/** Short month label for a filter chip in the given locale. */
export function monthLabel(month: number, locale: 'bg' | 'en'): string {
  const d = new Date(Date.UTC(2026, month, 1))
  return new Intl.DateTimeFormat(locale === 'bg' ? 'bg-BG' : 'en-GB', {
    month: 'short',
    timeZone: 'UTC',
  })
    .format(d)
    .replace('.', '')
}
