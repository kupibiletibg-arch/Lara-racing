import Image from 'next/image'

/**
 * Facility schema as shipped by the client. All POIs (numbered pins and
 * their labels) are baked into this raster map; the legend below lists the
 * IDs-to-labels from `lib/data/facilities.ts`.
 */
export function FacilityMap() {
  return (
    <div className="relative aspect-[1800/890] w-full overflow-hidden border rule bg-bg">
      <Image
        src="/facilities/map.jpg"
        alt="A1 Motor Park — facility map"
        fill
        priority
        sizes="(min-width: 1024px) 1200px, 100vw"
        className="object-contain"
      />
    </div>
  )
}
