import { getTranslations } from 'next-intl/server'

const BEFORE_KEYS = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6'] as const
const INCLUDED_KEYS = ['i1', 'i2', 'i3', 'i4', 'i5'] as const

/**
 * Two-column "Важно преди да дойдеш" / "Включено" block on the
 * open-track-day page. Left column carries a thin brand-red vertical
 * accent (echoes the screenshot reference); right column uses small
 * filled brand-red square bullets per item — both treatments stay
 * inside the existing site vocabulary (rule borders, telemetry
 * captions, font-display headings).
 */
export async function TrackDayInfo() {
  const t = await getTranslations('trackDays')

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
      {/* IMPORTANT — left column */}
      <div className="relative pl-6">
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-px bg-brand"
        />
        <p className="telemetry mb-2">{t('before.kicker')}</p>
        <h2 className="font-display font-bold text-[22px] md:text-[28px] leading-tight tracking-tight">
          {t('before.heading')}
        </h2>
        <ul className="mt-6 flex flex-col gap-4">
          {BEFORE_KEYS.map((k) => (
            <li
              key={k}
              className="text-ink/80 text-[14px] md:text-[15px] leading-relaxed"
            >
              {t(`before.${k}`)}
            </li>
          ))}
        </ul>
      </div>

      {/* INCLUDED — right column */}
      <div>
        <p className="telemetry mb-2">{t('included.kicker')}</p>
        <h2 className="font-display font-bold text-[22px] md:text-[28px] leading-tight tracking-tight">
          {t('included.heading')}
        </h2>
        <ul className="mt-6 flex flex-col gap-4">
          {INCLUDED_KEYS.map((k) => (
            <li
              key={k}
              className="flex items-start gap-3 text-ink/80 text-[14px] md:text-[15px] leading-relaxed"
            >
              <span
                aria-hidden
                className="shrink-0 mt-[7px] inline-block w-2 h-2 bg-brand"
              />
              <span>{t(`included.${k}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
