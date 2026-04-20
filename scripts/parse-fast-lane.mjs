#!/usr/bin/env node
// Parse Assetto Corsa `ai/fast_lane.ai` into SVG path + elevation JSON.
//
// AC fast_lane.ai format (stock KN5 tracks, format version = 7):
//   offset 0:   int32 LE  — version / header marker (observed: 7)
//   offset 4:   int32 LE  — point count (N)
//   offset 8:   int32 LE  — lap count / extra (ignored)
//   offset 12:  int32 LE  — extra (ignored)
//   offset 16+: N × 20 B  per point: { x:f32, y:f32, z:f32, ?:f32, ?:f32 }
// Stride empirically determined by inspect-ai.mjs: mean step 1.64m matches
// expected 3910m / 2443 = 1.60m spacing. Bytes 12..19 per record hold
// per-point AI data (length along lane + id / forward-vector bits); we ignore them.
// After the positions block, the file holds a further "extras" block (speed,
// gas/brake, radius, camber, …) that we don't need for rendering.
//
// Calibration from data/map.ini — SCALE_FACTOR=1 means 1 metre == 1 pixel.
// World (x,z) → map px: (x - X_OFFSET, z - Z_OFFSET).

import fs from 'node:fs'
import path from 'node:path'

const TRACK = process.argv[2] || '/Users/stefan_byalkov/Downloads/KS_A1_Motor_Park'
const OUT = process.argv[3] || '/Users/stefan_byalkov/Downloads/a1-motor-park/public/track'
const EXPECTED_LENGTH_M = 3910
const TARGET_POINTS = 800

function parseMapIni(file) {
  const txt = fs.readFileSync(file, 'utf8')
  const get = k => {
    const m = txt.match(new RegExp(`${k}\\s*=\\s*([\\-0-9.]+)`))
    if (!m) throw new Error(`map.ini missing ${k}`)
    return parseFloat(m[1])
  }
  return {
    width: get('WIDTH'),
    height: get('HEIGHT'),
    xOff: get('X_OFFSET'),
    zOff: get('Z_OFFSET'),
    scale: get('SCALE_FACTOR'),
  }
}

function parseFastLane(file) {
  const buf = fs.readFileSync(file)
  const count = buf.readInt32LE(4)
  const stride = 20
  const expected = 16 + count * stride
  if (buf.length < expected) {
    throw new Error(`fast_lane.ai truncated: ${buf.length} B, expected ≥ ${expected} for ${count} points at stride ${stride}`)
  }
  const pts = []
  for (let i = 0; i < count; i++) {
    const base = 16 + i * stride
    pts.push({
      x: buf.readFloatLE(base + 0),
      y: buf.readFloatLE(base + 4),
      z: buf.readFloatLE(base + 8),
    })
  }
  return { count, points: pts, bytes: buf.length }
}

// Perpendicular distance from point p to line (a,b).
function perpDist(p, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  const qx = a.x + t * dx
  const qy = a.y + t * dy
  return Math.hypot(p.x - qx, p.y - qy)
}

function douglasPeucker(points, epsilon) {
  if (points.length < 3) return points.slice()
  let maxD = 0, idx = 0
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], points[0], points[points.length - 1])
    if (d > maxD) { maxD = d; idx = i }
  }
  if (maxD > epsilon) {
    const left = douglasPeucker(points.slice(0, idx + 1), epsilon)
    const right = douglasPeucker(points.slice(idx), epsilon)
    return left.slice(0, -1).concat(right)
  }
  return [points[0], points[points.length - 1]]
}

function simplifyToTarget(points, target) {
  let lo = 0.01, hi = 20
  let best = points
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    const s = douglasPeucker(points, mid)
    if (s.length > target) { lo = mid } else { hi = mid; best = s }
    if (Math.abs(s.length - target) < Math.max(20, target * 0.02)) { best = s; break }
  }
  return best
}

function polylineLengthMetres(points) {
  // 2D horizontal length on the (x, z) plane, matching the quoted track length.
  let L = 0
  for (let i = 1; i < points.length; i++) {
    L += Math.hypot(points[i].xm - points[i - 1].xm, points[i].zm - points[i - 1].zm)
  }
  return L
}

function toPathD(points) {
  let d = `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 1; i < points.length; i++) {
    d += ` L${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`
  }
  d += ' Z'
  return d
}

function main() {
  const mapIni = parseMapIni(path.join(TRACK, 'data/map.ini'))
  console.log('map.ini:', mapIni)

  const fast = parseFastLane(path.join(TRACK, 'ai/fast_lane.ai'))
  console.log(`fast_lane.ai: ${fast.count} points, ${fast.bytes} B`)

  // Sanity: total polyline length in world metres vs expected.
  const raw = fast.points.map(p => ({ xm: p.x, ym: p.y, zm: p.z }))
  const totalM = polylineLengthMetres(raw)
  const errPct = Math.abs(totalM - EXPECTED_LENGTH_M) / EXPECTED_LENGTH_M * 100
  console.log(`raw polyline length: ${totalM.toFixed(1)} m (target ${EXPECTED_LENGTH_M} m, err ${errPct.toFixed(2)}%)`)
  // 2–3% is the expected chord-vs-arc undercount at ~1.6m point spacing.
  if (errPct > 3) {
    console.error('ABORT: length outside ±3% tolerance — format assumption probably wrong.')
    process.exit(1)
  }

  // Derive viewBox directly from the AI line's world bbox — map.ini calibration
  // doesn't fit this modded track's AI line into the PNG rectangle, so we ignore it
  // and use world (x, z) in metres with a small margin as our SVG coordinate space.
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
  for (const p of fast.points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.z < minZ) minZ = p.z
    if (p.z > maxZ) maxZ = p.z
  }
  const margin = 20 // metres
  const vbX = Math.floor(minX - margin)
  const vbZ = Math.floor(minZ - margin)
  const vbW = Math.ceil(maxX - minX + 2 * margin)
  const vbH = Math.ceil(maxZ - minZ + 2 * margin)
  console.log(`world bbox: x[${minX.toFixed(1)}, ${maxX.toFixed(1)}] z[${minZ.toFixed(1)}, ${maxZ.toFixed(1)}] → viewBox ${vbX} ${vbZ} ${vbW} ${vbH}`)

  // Use world (x, z) directly as SVG coords — 1 SVG unit = 1 metre.
  const projected = fast.points.map(p => ({
    x: p.x,
    y: p.z,
    elev: p.y,
  }))

  // Simplify.
  const simplified = simplifyToTarget(projected, TARGET_POINTS)
  console.log(`simplified to ${simplified.length} points`)

  const W = vbW, H = vbH
  const viewBox = `${vbX} ${vbZ} ${vbW} ${vbH}`

  // SVG path
  const d = toPathD(simplified)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" data-length="${EXPECTED_LENGTH_M}" data-points="${simplified.length}" fill="none">
  <path id="racing-line" d="${d}" stroke="#C8102E" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
</svg>
`
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, 'a1.svg'), svg)

  // Elevation: resample 200 buckets over cumulative distance.
  const cum = [0]
  for (let i = 1; i < projected.length; i++) {
    const dx = projected[i].x - projected[i - 1].x
    const dy = projected[i].y - projected[i - 1].y
    cum.push(cum[i - 1] + Math.hypot(dx, dy))
  }
  const total = cum[cum.length - 1]
  const buckets = 200
  const elevation = []
  let j = 0
  let minElev = Infinity, maxElev = -Infinity
  for (let b = 0; b < buckets; b++) {
    const target = (b / (buckets - 1)) * total
    while (j < cum.length - 1 && cum[j + 1] < target) j++
    const seg = cum[j + 1] - cum[j] || 1
    const t = (target - cum[j]) / seg
    const e = projected[j].elev * (1 - t) + projected[Math.min(j + 1, projected.length - 1)].elev * t
    if (e < minElev) minElev = e
    if (e > maxElev) maxElev = e
    elevation.push({ d: b / (buckets - 1), y: e })
  }
  fs.writeFileSync(
    path.join(OUT, 'a1-elevation.json'),
    JSON.stringify({ min: minElev, max: maxElev, buckets: elevation }, null, 2),
  )

  // Provisional sectors: thirds by length.
  const sectors = [
    { id: 1, start: 0, end: 1 / 3 },
    { id: 2, start: 1 / 3, end: 2 / 3 },
    { id: 3, start: 2 / 3, end: 1 },
  ]
  fs.writeFileSync(path.join(OUT, 'a1-sectors.json'), JSON.stringify(sectors, null, 2))

  // Also write parsed-path raw length for runtime use.
  fs.writeFileSync(
    path.join(OUT, 'a1.meta.json'),
    JSON.stringify({
      lengthM: EXPECTED_LENGTH_M,
      lengthMeasuredM: Math.round(totalM),
      viewBox: { w: W, h: H },
      points: simplified.length,
      elevationRange: { min: Math.round(minElev), max: Math.round(maxElev) },
    }, null, 2),
  )

  console.log('wrote:')
  console.log('  ', path.join(OUT, 'a1.svg'))
  console.log('  ', path.join(OUT, 'a1-elevation.json'))
  console.log('  ', path.join(OUT, 'a1-sectors.json'))
  console.log('  ', path.join(OUT, 'a1.meta.json'))
  return { vbX, vbZ, vbW, vbH }
}

// Also run for pit_lane if present. Uses the SAME viewBox as the main racing line
// (derived from fast_lane's bbox) so they overlay correctly.
function pitLane(mainBbox) {
  const pitPath = path.join(TRACK, 'ai/pit_lane.ai')
  if (!fs.existsSync(pitPath)) return
  const fast = parseFastLane(pitPath)
  const projected = fast.points.map(p => ({ x: p.x, y: p.z }))
  const simplified = simplifyToTarget(projected, 200)
  const d = simplified.reduce((acc, p, i) =>
    acc + (i ? ` L${p.x.toFixed(2)} ${p.y.toFixed(2)}` : `M${p.x.toFixed(2)} ${p.y.toFixed(2)}`), '')
  const { vbX, vbZ, vbW, vbH } = mainBbox
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbZ} ${vbW} ${vbH}" fill="none">
  <path id="pit-lane" d="${d}" stroke="#F2EDE4" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="6 6" stroke-linecap="round" />
</svg>
`
  fs.writeFileSync(path.join(OUT, 'a1-pit.svg'), svg)
  console.log('wrote:  ', path.join(OUT, 'a1-pit.svg'))
}

const bbox = main()
pitLane(bbox)
