import { getTranslations } from 'next-intl/server'

type ExtraItem = {
  /** i18n key suffix under `trackDays.extras.*` for the label. */
  labelKey: string
  /** i18n key suffix under `trackDays.extras.*` for the price. */
  priceKey: string
  /** Icon glyph rendered to the left of the label. */
  icon: 'helmet' | 'transponder' | 'wheel' | 'pit'
}

const EXTRAS: ExtraItem[] = [
  { labelKey: 'helmetLabel', priceKey: 'helmetPrice', icon: 'helmet' },
  { labelKey: 'transponderLabel', priceKey: 'transponderPrice', icon: 'transponder' },
  { labelKey: 'passengerLabel', priceKey: 'passengerPrice', icon: 'wheel' },
  { labelKey: 'secondPilotLabel', priceKey: 'secondPilotPrice', icon: 'wheel' },
  { labelKey: 'boxWeekLabel', priceKey: 'boxWeekPrice', icon: 'pit' },
  { labelKey: 'boxFridayLabel', priceKey: 'boxFridayPrice', icon: 'pit' },
  { labelKey: 'boxWeekendLabel', priceKey: 'boxWeekendPrice', icon: 'pit' },
]

/**
 * Tariff grid for open-track-day add-ons (helmet, transponder,
 * passenger / second-pilot fees, pit-box rentals). Each row is a
 * small `border rule bg-bg/40` chip, label on the left in
 * font-display, price on the right in brand-red font-mono. Inline
 * SVG glyphs reuse the same icon vocabulary as the Header / Footer
 * social icons — no new icon set pulled in.
 */
export async function TrackDayExtras() {
  const t = await getTranslations('trackDays.extras')

  return (
    <div>
      <p className="telemetry mb-2">{t('kicker')}</p>
      <h2 className="font-display font-bold text-[22px] md:text-[28px] leading-tight tracking-tight">
        {t('heading')}
      </h2>

      <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EXTRAS.map((it) => (
          <li
            key={it.labelKey}
            className="border rule bg-bg/40 px-4 py-3 flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-3 min-w-0">
              <Icon kind={it.icon} />
              <span className="font-display text-[14px] md:text-[15px] text-ink truncate">
                {t(it.labelKey)}
              </span>
            </span>
            <span className="shrink-0 font-mono tracking-mono text-[14px] md:text-[15px] text-brand tabular-nums">
              {t(it.priceKey)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Icon({ kind }: { kind: ExtraItem['icon'] }) {
  const cls =
    'shrink-0 h-[18px] w-[18px] text-ink/55'
  switch (kind) {
    case 'helmet':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 13a8 8 0 0 1 16 0v4H4z" />
          <path d="M4 17h16" />
          <path d="M9 13h6" />
        </svg>
      )
    case 'transponder':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="6" y="9" width="12" height="9" rx="1.5" />
          <path d="M9 6v3M15 6v3" />
          <path d="M10 13h4" />
        </svg>
      )
    case 'wheel':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
        </svg>
      )
    case 'pit':
    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="6" width="18" height="13" rx="1" />
          <path d="M3 10h18M8 6V4M16 6V4" />
        </svg>
      )
  }
}
