import type { elevation } from '@/lib/data/track'

export type Segment = {
  d: string
  elevM: number
  fromFrac: number
  toFrac: number
  length: number
}

type Elevation = typeof elevation

/**
 * Slice a single SVG path into `count` contiguous sub-paths, each with its own
 * average elevation (in metres) looked up from the elevation buckets.
 *
 * Adjacent segments overlap by one point so rendered strokes meet seamlessly.
 *
 * Note: this only understands `M`/`L`/`Z` commands — which is what
 * `scripts/parse-fast-lane.mjs` emits. Don't feed arbitrary paths.
 */
export function buildSegments(
  trackPath: string,
  elev: Elevation,
  count: number,
): Segment[] {
  // Parse points from the path.
  const tokens = trackPath.match(/[MLZz][^MLZz]*/g) ?? []
  const pts: { x: number; y: number }[] = []
  for (const tok of tokens) {
    const cmd = tok[0]
    if (cmd === 'Z' || cmd === 'z') continue
    const nums = tok.slice(1).trim().split(/[\s,]+/).map(Number)
    if (nums.length >= 2 && isFinite(nums[0]) && isFinite(nums[1])) {
      pts.push({ x: nums[0], y: nums[1] })
    }
  }
  if (pts.length < 2) return []

  // Cumulative length along the polyline (SVG units).
  const cum = [0]
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y))
  }
  const totalLen = cum[cum.length - 1] || 1

  const segments: Segment[] = []
  const step = pts.length / count

  for (let s = 0; s < count; s++) {
    const start = Math.floor(s * step)
    // End is inclusive of next segment's start for a 1-point overlap
    const end = Math.min(pts.length - 1, Math.floor((s + 1) * step))
    if (end <= start) continue

    const slice = pts.slice(start, end + 1)
    const d =
      slice
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ')

    const fromFrac = cum[start] / totalLen
    const toFrac = cum[end] / totalLen
    const midFrac = (fromFrac + toFrac) / 2

    // Look up elevation at midpoint, smoothed across ±kernel buckets with a
    // triangular weight. Killing high-frequency noise here is what makes the
    // segment-to-segment transitions read as a smooth ribbon rather than stairs.
    const buckets = elev.buckets
    const elevM = sampleElevation(buckets, midFrac, 4)

    segments.push({
      d,
      elevM,
      fromFrac,
      toFrac,
      length: cum[end] - cum[start],
    })
  }

  return segments
}

// Triangular-kernel smoothing — weights neighbouring buckets so the sampled
// elevation reads as a continuous curve rather than jumping between bucket values.
function sampleElevation(
  buckets: { d: number; y: number }[],
  frac: number,
  radius: number,
): number {
  if (buckets.length === 0) return 0
  const center = frac * (buckets.length - 1)
  let sum = 0
  let totalWeight = 0
  for (let k = -radius; k <= radius; k++) {
    const idx = Math.round(center + k)
    if (idx < 0 || idx >= buckets.length) continue
    const w = 1 - Math.abs(k) / (radius + 1)
    sum += buckets[idx].y * w
    totalWeight += w
  }
  return totalWeight > 0
    ? sum / totalWeight
    : buckets[Math.max(0, Math.min(buckets.length - 1, Math.round(center)))].y
}
