import { partners } from '@/lib/data/partners'
import { PartnerTile } from './PartnerTile'

/**
 * Infinite-scroll partner carousel for the footer. Uses a duplicated list
 * and a CSS keyframe translation for a seamless loop — pure CSS, no JS.
 * The animation is defined in `app/globals.css` (see the `marquee-a1` rule).
 */
export function PartnersMarquee() {
  const loop = [...partners, ...partners]
  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y rule bg-ink/[0.02] py-5"
    >
      <div className="flex gap-5 animate-[marquee-a1_40s_linear_infinite] w-max">
        {loop.map((p, i) => (
          <div key={`${p.slug}-${i}`} className="shrink-0">
            <PartnerTile partner={p} size="sm" />
          </div>
        ))}
      </div>
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg to-transparent" />
    </div>
  )
}
