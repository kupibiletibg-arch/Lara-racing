'use client'

import { useCallback, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { CatalogEvent, CatalogCategory } from '@/lib/calendar/buildCatalog'
import { sortCatalog } from '@/lib/calendar/buildCatalog'
import { CategoryChips, type ChipOption } from './CategoryChips'
import { EventCard } from './EventCard'

type Props = {
  events: CatalogEvent[]
}

type WhenFilter = 'all' | 'upcoming' | 'past'
type CategoryFilter = 'all' | CatalogCategory

const DEFAULT_FILTERS = {
  type: 'all' as CategoryFilter,
  when: 'all' as WhenFilter,
}

export function EventsCatalog({ events }: Props) {
  const t = useTranslations('calendar')
  const tType = useTranslations('eventType')
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const current = {
    type: ((params.get('type') ?? DEFAULT_FILTERS.type) as CategoryFilter),
    when: ((params.get('when') ?? DEFAULT_FILTERS.when) as WhenFilter),
  }

  const setFilter = useCallback(
    (key: 'type' | 'when', value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value === DEFAULT_FILTERS[key]) next.delete(key)
      else next.set(key, value)
      // Drop any legacy `month` query param so URLs stay clean now
      // that month filtering has been removed.
      next.delete('month')
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

  const filtered = useMemo(() => {
    return sortCatalog(
      events.filter((e) => {
        if (current.type !== 'all' && e.category !== current.type) return false

        if (current.when !== 'all') {
          const past = e.startDate && e.startDate < now && !e.dateTBD
          if (current.when === 'past' && !past) return false
          if (current.when === 'upcoming' && past) return false
        }

        return true
      }),
    )
  }, [events, current.type, current.when, now])

  const hasAnyFilter =
    current.type !== 'all' || current.when !== 'all'

  // The category list is collapsed by default — only expanded when the
  // viewer clicks the chevron, OR when a non-default category filter is
  // already active (so they can see / change which one without an
  // extra tap).
  const [categoryOpen, setCategoryOpen] = useState<boolean>(
    () => current.type !== 'all',
  )
  const activeCategoryLabel =
    current.type === 'all'
      ? null
      : (categoryOptions.find((o) => o.value === current.type)?.label ?? null)

  const onResetClick = useCallback(() => {
    resetFilters()
    setCategoryOpen(false)
  }, [resetFilters])

  return (
    <div>
      <div className="sticky top-20 md:top-28 z-20 -mx-5 md:-mx-8 px-5 md:px-8 py-4 md:py-5 mb-8 md:mb-12 bg-bg/80 backdrop-blur-md border-b rule">
        {/* Primary filter — Кога. Always visible chips. */}
        <FilterRow label={t('filters.when')}>
          <CategoryChips
            ariaLabel={t('filters.when')}
            options={whenOptions}
            value={current.when}
            onChange={(v) => setFilter('when', v)}
          />
        </FilterRow>

        {/* Primary filter — Категория. Collapsed by default; the chips
            slide in beneath the toggle button only after the chevron is
            clicked (or when a category filter is already active). */}
        <div className="mb-2 md:mb-3 last:mb-0">
          <button
            type="button"
            onClick={() => setCategoryOpen((o) => !o)}
            aria-expanded={categoryOpen}
            aria-controls="filters-category-panel"
            className="flex flex-col md:flex-row md:items-center md:gap-4 w-full text-left"
          >
            <span className="telemetry !text-[10px] md:!text-[11px] md:min-w-[96px] mb-1.5 md:mb-0 inline-flex items-center gap-2">
              {t('filters.category')}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className={`h-3 w-3 transition-transform duration-200 ${
                  categoryOpen ? 'rotate-180' : ''
                }`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
            {/* When collapsed and a filter is active, surface the active
                value next to the label so the viewer doesn't have to
                expand to know which category is filtering the list. */}
            {!categoryOpen && activeCategoryLabel && (
              <span className="font-mono tracking-mono uppercase text-[11px] text-brand">
                · {activeCategoryLabel}
              </span>
            )}
          </button>

          <div
            id="filters-category-panel"
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              categoryOpen
                ? 'grid-rows-[1fr] opacity-100 mt-2 md:mt-3'
                : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="md:pl-[112px]">
                <CategoryChips
                  ariaLabel={t('filters.category')}
                  options={categoryOptions}
                  value={current.type}
                  onChange={(v) => setFilter('type', v)}
                />
              </div>
            </div>
          </div>
        </div>

        {hasAnyFilter && (
          <div className="mt-2">
            <button
              type="button"
              onClick={onResetClick}
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
