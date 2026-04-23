'use client'

import { useLocale } from 'next-intl'
import { facilities } from '@/lib/data/facilities'

export function FacilityLegend() {
  const locale = useLocale()
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-3">
      {facilities.map(f => (
        <li key={f.id} className="flex items-baseline gap-4 border-b rule pb-3">
          <span className="font-mono font-bold text-brand text-[13px] tabular-nums">
            {f.id}
          </span>
          <span className="text-ink/85 text-[14px]">
            {locale === 'bg' ? f.labelBg : f.labelEn}
          </span>
        </li>
      ))}
    </ul>
  )
}
