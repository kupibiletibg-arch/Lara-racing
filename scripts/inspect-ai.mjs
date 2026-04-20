// Auto-detect fast_lane.ai per-point stride.
// For each candidate stride s, read 50 consecutive points at offset 16 + i*s,
// treating first 3 f32s as (x, y, z). Score = mean segment distance;
// valid strides have mean ~1-3m (racing-line spacing for 3910m / ~2443 points).

import fs from 'node:fs'
const buf = fs.readFileSync('/Users/stefan_byalkov/Downloads/KS_A1_Motor_Park/ai/fast_lane.ai')
const N = buf.readInt32LE(4)
console.log('file', buf.length, 'B · N =', N)

const strides = [12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 96]
const results = []
for (const s of strides) {
  const last = 16 + (N - 1) * s
  if (last + 12 > buf.length) continue
  const sample = 50
  const pts = []
  let ok = true
  for (let i = 0; i < sample; i++) {
    const base = 16 + i * s
    const x = buf.readFloatLE(base)
    const y = buf.readFloatLE(base + 4)
    const z = buf.readFloatLE(base + 8)
    if (!isFinite(x) || !isFinite(y) || !isFinite(z) ||
        Math.abs(x) > 2e4 || Math.abs(z) > 2e4 || Math.abs(y) > 5e3) { ok = false; break }
    pts.push({ x, y, z })
  }
  if (!ok) continue
  let tot = 0, maxStep = 0
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z)
    tot += d
    if (d > maxStep) maxStep = d
  }
  const mean = tot / (pts.length - 1)
  results.push({ s, mean, maxStep, expected: 3910 / N, lastPt: pts[pts.length - 1] })
}
results.sort((a, b) => Math.abs(a.mean - a.expected) - Math.abs(b.mean - b.expected))
console.log('stride | meanStep | maxStep | expectedStep | last sample pt')
for (const r of results.slice(0, 8)) {
  console.log(` ${String(r.s).padStart(3)}  | ${r.mean.toFixed(2)}    | ${r.maxStep.toFixed(2)}   | ${r.expected.toFixed(2)}         | (${r.lastPt.x.toFixed(1)}, ${r.lastPt.y.toFixed(1)}, ${r.lastPt.z.toFixed(1)})`)
}

// Also try: point block might start later (e.g. offset 32 if there's a sub-header).
console.log('\n-- trying dataOffset 16, 20, 24, 28, 32 with stride 40 --')
for (const off of [16, 20, 24, 28, 32]) {
  for (const s of [40, 44, 48]) {
    const last = off + (N - 1) * s
    if (last + 12 > buf.length) continue
    const pts = []
    let ok = true
    for (let i = 0; i < 30; i++) {
      const base = off + i * s
      const x = buf.readFloatLE(base); const y = buf.readFloatLE(base + 4); const z = buf.readFloatLE(base + 8)
      if (!isFinite(x) || Math.abs(x) > 2e4 || Math.abs(z) > 2e4 || Math.abs(y) > 5e3) { ok = false; break }
      pts.push({ x, y, z })
    }
    if (!ok) continue
    let tot = 0
    for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i].x - pts[i-1].x, pts[i].z - pts[i-1].z)
    const mean = tot / (pts.length - 1)
    if (mean > 0.3 && mean < 5) console.log(`  off=${off} stride=${s} → mean step ${mean.toFixed(2)}m, first=(${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)},${pts[0].z.toFixed(1)})`)
  }
}
