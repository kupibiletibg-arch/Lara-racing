import { trackPath, trackViewBox } from '@/lib/data/track'

type LogoProps = {
  variant?: 'full' | 'mark'
  className?: string
}

/**
 * Layout matches the physical A1 Motor Park mark:
 *   row 1: [A1] [track outline]
 *   row 2: motor park
 */
export function Logo({ variant = 'full', className }: LogoProps) {
  if (variant === 'mark') {
    return <MiniTrack className={className} />
  }

  return (
    <div className={`inline-flex flex-col items-start leading-none ${className ?? ''}`}>
      <div className="flex items-center gap-1.5">
        <div className="flex items-start">
          <span className="font-display font-bold text-[26px] md:text-[30px] leading-none">A</span>
          <span className="font-display font-bold text-[14px] md:text-[16px] leading-none relative top-[2px] md:top-[3px]">
            1
          </span>
        </div>
        <MiniTrack className="h-7 md:h-8 w-14 md:w-16 text-ink" />
      </div>
      <div className="font-display font-medium text-[11px] md:text-[13px] tracking-[0.02em] whitespace-nowrap mt-1 md:mt-1.5">
        motor park
      </div>
    </div>
  )
}

function MiniTrack({ className }: { className?: string }) {
  const { x, y, w, h } = trackViewBox
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      className={className}
      fill="none"
      aria-hidden
      style={{ transform: 'rotate(90deg)' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={trackPath}
        stroke="currentColor"
        strokeWidth="34"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
