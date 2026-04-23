import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

/**
 * Facility schema. Renders the client-supplied raster schema image
 * ("Схема съоръжения А1 мотор парк.png") — numbered POIs, track
 * outline, labels and all — exactly as delivered, inside a framed
 * container that matches the site's section scaffold. The numbered
 * legend beside this map on /facilities is driven by the same
 * `facilities` data file so id ↔ label stays in sync with the
 * visible schema.
 */
export async function FacilityMap() {
  const t = await getTranslations('facilities')
  return (
    <figure className="relative w-full overflow-hidden border rule bg-bg">
      <div className="relative aspect-[18/10] w-full">
        <Image
          src="/facilities/schema.webp"
          alt={t('title')}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority={false}
          className="object-contain"
        />
      </div>
    </figure>
  )
}
