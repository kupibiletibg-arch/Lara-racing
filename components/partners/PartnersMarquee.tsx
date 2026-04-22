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
    <div className="relative overflow-hidden py-4 md:py-8 group">
      <div className="flex gap-4 md:gap-14 items-center animate-[marquee-a1_40s_linear_infinite] hover:[animation-play-state:paused] w-max">
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
