import Image from 'next/image'
import type { Partner } from '@/lib/data/partners'

type PartnerTileProps = {
  partner: Partner
  /** Display size — 'md' for page grid, 'sm' for footer carousel. */
  size?: 'sm' | 'md'
}

/**
 * Card that links to a partner's website. Gracefully degrades to a
 * non-clickable tile when `partner.url` is an empty string (placeholder
 * state before URLs are supplied).
 */
export function PartnerTile({ partner, size = 'md' }: PartnerTileProps) {
  const tileClasses =
    size === 'sm'
      ? 'h-14 w-36 md:h-16 md:w-40'
      : 'h-28 w-full md:h-32'

  const content = (
    <div
      className={`${tileClasses} relative flex items-center justify-center rounded-sm bg-ink/[0.03] border rule px-4 py-3 transition-all duration-200 group-hover:bg-ink/[0.07] group-hover:border-brand/40`}
    >
      <Image
        src={partner.logoSrc}
        alt={partner.alt}
        fill
        sizes={size === 'sm' ? '160px' : '240px'}
        className="object-contain p-3 opacity-85 group-hover:opacity-100 transition-opacity"
      />
    </div>
  )

  if (!partner.url) {
    return (
      <div
        className="group block"
        aria-label={partner.name}
        title={partner.name}
      >
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
