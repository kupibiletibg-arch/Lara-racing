import Image from 'next/image'

type LogoProps = {
  variant?: 'full' | 'mark'
  className?: string
}

/**
 * Official A1 Motor Park logo (raster PNG).
 * Intrinsic dimensions: 150 × 92 (≈1.63:1).
 */
export function Logo({ variant = 'full', className }: LogoProps) {
  const sizeClasses =
    variant === 'mark'
      ? 'h-10 md:h-12 w-auto'
      : 'h-24 md:h-28 w-auto'

  return (
    <Image
      src="/brand/a1-motor-park-logo.png"
      alt="A1 Motor Park"
      width={150}
      height={92}
      priority
      className={`${sizeClasses} ${className ?? ''}`.trim()}
    />
  )
}
