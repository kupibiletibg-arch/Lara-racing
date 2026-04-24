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
    // No fixed-aspect wrapper: the image sizes itself (width/height props
    // lock its intrinsic ratio via next/image) so the figure hugs the
    // schema exactly — no letterbox bars above or below.
    <figure className="relative w-full overflow-hidden border rule bg-bg">
      <Image
        src="/facilities/schema.webp"
        alt={t('title')}
        width={3600}
        height={1780}
        sizes="(max-width: 1024px) 100vw, 60vw"
        priority={false}
        className="block w-full h-auto"
      />
    </figure>
  )
}
