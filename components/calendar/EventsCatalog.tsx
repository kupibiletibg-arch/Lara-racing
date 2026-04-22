'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { CatalogEvent, CatalogCategory } from '@/lib/calendar/buildCatalog'
import { sortCatalog } from '@/lib/calendar/buildCatalog'
import { monthLabel } from '@/lib/calendar/formatDateRange'
import { CategoryChips, type ChipOption } from './CategoryChips'
import { EventCard } from './EventCard'

type Props = {
  events: CatalogEvent[]
}

type WhenFilter = 'all' | 'upcoming' | 'past'
type CategoryFilter = 'all' | CatalogCategory
type MonthFilter = 'all' | string // "01".."12"

const DEFAULT_FILTERS = {
  type: 'all' as CategoryFilter,
  when: 'all' as WhenFilter,
  month: 'all' as MonthFilter,
}

export function EventsCatalog({ events }: Props) {
  const locale = useLocale() as 'bg' | 'en'
  const t = useTranslations('calendar')
  const tType = useTranslations('eventType')
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const current = {
    type: ((params.get('type') ?? DEFAULT_FILTERS.type) as CategoryFilter),
    when: ((params.get('when') ?? DEFAULT_FILTERS.when) as WhenFilter),
    month: (params.get('month') ?? DEFAULT_FILTERS.month) as MonthFilter,
  }

  const setFilter = useCallback(
    (key: 'type' | 'when' | 'month', value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value === DEFAULT_FILTERS[key]) next.delete(key)
      else next.set(key, value)
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router],
  )

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [pathname, router])

  const now = useMemo(() => {
    const d = new Date()
    d.setUTCHours(0, 0, 0, 0)
    return d
  }, [])

  // Build option lists based on ALL events (before filtering) so chip counts
  // stay stable and reflect the full dataset.
  const categoryOptions = useMemo<ChipOption<CategoryFilter>[]>(() => {
    const cats = new Set<CatalogCategory>()
    for (const e of events) cats.add(e.category)
    const list: ChipOption<CategoryFilter>[] = [
      { value: 'all', label: t('filters.all'), count: events.length },
    ]
    for (const c of cats) {
      list.push({
        value: c,
        label: tType(c),
        count: events.filter((e) => e.category === c).length,
      })
    }
    return list
  }, [events, t, tType])

  const whenOptions = useMemo<ChipOption<WhenFilter>[]>(() => {
    const isPast = (e: CatalogEvent) => e.startDate && e.startDate < now && !e.dateTBD
    const isUpcoming = (e: CatalogEvent) => !isPast(e)
    return [
      { value: 'all', label: t('filters.all'), count: events.length },
      { value: 'upcoming', label: t('filters.upcoming'), count: events.filter(isUpcoming).length },
      { value: 'past', label: t('filters.past'), count: events.filter(isPast).length },
    ]
  }, [events, t, now])

  const monthOptions = useMemo<ChipOption<MonthFilter>[]>(() => {
    const months = new Set<number>()
    for (const e of events) if (e.startDate) months.add(e.startDate.getUTCMonth())
    const sorted = Array.from(months).sort((a, b) => a - b)
    const list: ChipOption<MonthFilter>[] = [
      { value: 'all', label: t('filters.all') },
    ]
    for (const m of sorted) {
      const key = String(m + 1).padStart(2, '0')
      list.push({
        value: key,
        label: monthLabel(m, locale),
        count: events.filter((e) => e.startDate?.getUTCMonth() === m).length,
      })
    }
    return list
  }, [events, t, locale])

  const filtered = useMemo(() => {
    return sortCatalog(
      events.filter((e) => {
        if (current.type !== 'all' && e.category !== current.type) return false

        if (current.when !== 'all') {
          const past = e.startDate && e.startDate < now && !e.dateTBD
          if (current.when === 'past' && !past) return false
          if (current.when === 'upcoming' && past) return false
        }

        if (current.month !== 'all') {
          if (!e.startDate) return false
          const mm = String(e.startDate.getUTCMonth() + 1).padStart(2, '0')
          if (mm !== current.month) return false
        }

        return true
      }),
    )
  }, [events, current.type, current.when, current.month, now])

  const hasAnyFilter =
    current.type !== 'all' || current.when !== 'all' || current.month !== 'all'

  return (
    <div>
      <div className="sticky top-24 md:top-28 z-20 -mx-5 md:-mx-8 px-5 md:px-8 py-4 md:py-5 mb-8 md:mb-12 bg-bg/80 backdrop-blur-md border-b rule">
        <FilterRow label={t('filters.category')}>
          <CategoryChips
            ariaLabel={t('filters.category')}
            options={categoryOptions}
            value={current.type}
            onChange={(v) => setFilter('type', v)}
          />
        </FilterRow>
        <FilterRow label={t('filters.when')}>
          <CategoryChips
            ariaLabel={t('filters.when')}
            options={whenOptions}
            value={current.when}
            onChange={(v) => setFilter('when', v)}
          />
        </FilterRow>
        {monthOptions.length > 1 && (
          <FilterRow label={t('filters.month')}>
            <CategoryChips
              ariaLabel={t('filters.month')}
              options={monthOptions}
              value={current.month}
              onChange={(v) => setFilter('month', v)}
            />
          </FilterRow>
        )}
        {hasAnyFilter && (
          <div className="mt-2">
            <button
              type="button"
              onClick={resetFilters}
              className="font-mono tracking-mono uppercase text-[10px] text-ink/60 hover:text-brand transition-colors border-b rule pb-0.5"
            >
              {t('filters.reset')} ×
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 md:py-24 text-center">
          <p className="font-mono tracking-mono uppercase text-[11px] text-ink/60">
            {t('empty')}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 font-mono tracking-mono uppercase text-[11px] text-brand hover:text-brand-deep transition-colors border-b border-brand pb-0.5"
          >
            {t('filters.reset')}
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((e) => {
            const isPast = Boolean(e.startDate && e.startDate < now && !e.dateTBD)
            return (
              <li key={e.slug}>
                <EventCard event={e} isPast={isPast} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-2 md:mb-3 last:mb-0">
      <p className="telemetry !text-[10px] md:!text-[11px] md:min-w-[96px] mb-1.5 md:mb-0">
        {label}
      </p>
      {children}
    </div>
  )
}
