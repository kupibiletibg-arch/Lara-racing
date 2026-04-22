import Image from 'next/image'
import type { Partner } from '@/lib/data/partners'

type PartnerTileProps = {
  partner: Partner
  /** Display size — 'md' for page grid, 'sm' for footer carousel. */
  size?: 'sm' | 'md'
}

/**
 * Plain, frameless partner logo. Gracefully degrades to a non-clickable
 * element when `partner.url` is an empty string.
 */
export function PartnerTile({ partner, size = 'md' }: PartnerTileProps) {
  const tileClasses =
    size === 'sm'
      ? 'h-10 w-24 md:h-16 md:w-44'
      : 'h-36 w-full md:h-40'

  const content = (
    <div className={`${tileClasses} relative flex items-center justify-center`}>
      <Image
        src={partner.logoSrc}
        alt={partner.alt}
        fill
        sizes={size === 'sm' ? '240px' : '320px'}
        className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
      />
    </div>
  )

  if (!partner.url) {
    return (
      <div className="group block" aria-label={partner.name} title={partner.name}>
        {content}
      </div>
    )
  }

  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      aria-label={partner.name}
      title={partner.name}
    >
      {content}
    </a>
  )
}
