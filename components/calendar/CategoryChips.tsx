'use client'

import clsx from 'clsx'

export type ChipOption<V extends string = string> = {
  value: V
  label: string
  count?: number
}

type Props<V extends string> = {
  ariaLabel: string
  options: ChipOption<V>[]
  value: V
  onChange: (next: V) => void
}

/**
 * Horizontal chip strip used for category / time-window / month filters.
 * Selected chip is solid brand red on ink; the rest are ghost with a
 * hairline border. Overflow horizontally on narrow screens.
 */
export function CategoryChips<V extends string>({ ariaLabel, options, value, onChange }: Props<V>) {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className="flex flex-wrap items-center gap-1.5 md:gap-2"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'inline-flex items-center gap-1.5 font-mono tracking-mono uppercase text-[10px] md:text-[11px] px-2.5 py-1.5 border transition-colors',
              active
                ? 'bg-brand border-brand text-ink'
                : 'bg-transparent rule text-ink/65 hover:text-ink hover:border-ink/40',
            )}
          >
            <span>{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span className={clsx('tabular-nums', active ? 'text-ink/80' : 'text-ink/40')}>
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
