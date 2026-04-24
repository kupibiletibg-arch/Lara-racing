import { setRequestLocale, getTranslations } from 'next-intl/server'
import { trackMeta, elevation } from '@/lib/data/track'

export default async function TrackPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations('track')

  const W = 1000
  const H = 140
  const range = elevation.max - elevation.min || 1
  const profilePath = elevation.buckets
    .map((b, i) => {
      const x = b.d * W
      const y = H - 10 - ((b.y - elevation.min) / range) * (H - 30)
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <section className="mx-auto max-w-[1200px] px-5 md:px-8 py-12 md:py-20">
      <p className="telemetry mb-3">TRACK · A1 MOTOR PARK</p>
      <h1 className="font-display font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-tight">
        {t('title')}
      </h1>

      <dl className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
        <Stat label={t('lengthLabel')} value="3,910 M" />
        <Stat label={t('widthLabel')} value="15 M" />
        <Stat label={t('turnsLabel')} value="15" />
        <Stat label={t('pitboxesLabel')} value="25" />
        <Stat label={t('altitudeLabel')} value="585 M" />
        <Stat label={t('directionLabel')} value={t('direction')} />
      </dl>

      {/* Elevation profile moved up — sits directly under the track
          stats now that the facility schema has been removed from this
          page (facilities live on their own /facilities route). */}
      <div className="mt-16">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display font-bold text-[24px] md:text-[32px] tracking-tight">
            {t('elevationHeading')}
          </h2>
          <p className="telemetry">
            Δ{trackMeta.elevationRange.max - trackMeta.elevationRange.min}M
          </p>
        </div>
        <p className="mt-2 text-ink/60 text-sm">{t('elevationCaption')}</p>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="mt-6 w-full h-32 md:h-40"
          aria-label="Elevation profile"
        >
          <line x1={0} y1={H - 10} x2={W} y2={H - 10} stroke="var(--muted)" strokeWidth="1" />
          <path
            d={`${profilePath} L${W} ${H - 10} L0 ${H - 10} Z`}
            fill="var(--brand)"
            fillOpacity="0.1"
          />
          <path
            d={profilePath}
            stroke="var(--brand)"
            strokeWidth="1.5"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="flex justify-between mt-2 font-mono tracking-mono text-[11px] text-ink/40">
          <span>0 M</span>
          <span>{trackMeta.lengthM} M</span>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t rule pt-3">
      <dt className="telemetry mb-1">{label}</dt>
      <dd className="font-display font-medium text-[22px] md:text-[28px] text-ink">{value}</dd>
    </div>
  )
}
