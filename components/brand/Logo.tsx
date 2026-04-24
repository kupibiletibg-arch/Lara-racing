import Image from 'next/image'

type LogoProps = {
  variant?: 'full' | 'mark'
  className?: string
}

/**
 * Official A1 Motor Park logo (raster PNG).
 * Intrinsic dimensions: 1000 × 252 (≈3.97:1) — hi-res supplied by the client.
 */
export function Logo({ variant = 'full', className }: LogoProps) {
  const sizeClasses =
    variant === 'mark'
      ? 'h-10 md:h-12 w-auto'
      : 'h-12 md:h-16 w-auto'

  return (
    <Image
      src="/brand/a1-motor-park-logo.png"
      alt="A1 Motor Park"
      width={1000}
      height={252}
      priority
      className={`${sizeClasses} ${className ?? ''}`.trim()}
    />
  )
}
