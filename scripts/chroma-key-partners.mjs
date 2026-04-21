import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIR = resolve(__dirname, '../public/partners')

// Partners whose logos arrived on a uniform dark background (extracted from
// the "PDF top-half" variants). We chroma-key that background to alpha 0 so
// the logo floats freely on our dark site.
//
// BMW Club, Endurance 999 and BRAID are NOT processed here because they
// either ship on white/textured backgrounds or already have transparency.
const TARGETS = [
  'pulse.png',
  'premium-rally.png',
  'speed-sector.png',
  'rally-falcon.png',
  'super-cars-run.png',
  'margel.png',
  'red-zone.png',
  'justpablo.png',
  'gumi7.png',
  'mirafiori.png',
]

// Pixels within DIST of the sampled corner colour become transparent.
const DIST = 55
// Soft edge band — pixels DIST..DIST+SOFT get proportional alpha for a
// cleaner anti-aliased cut-out.
const SOFT = 20

function chroma(r, g, b, a, bgR, bgG, bgB) {
  const dr = r - bgR
  const dg = g - bgG
  const db = b - bgB
  const d = Math.sqrt(dr * dr + dg * dg + db * db)
  if (d <= DIST) return 0
  if (d <= DIST + SOFT) return Math.round(a * ((d - DIST) / SOFT))
  return a
}

for (const name of TARGETS) {
  const input = join(DIR, name)
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Sample background colour from the very top-left pixel (safe for these
  // PDF-derived crops where the logo is centred).
  const bgR = data[0]
  const bgG = data[1]
  const bgB = data[2]

  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = chroma(
      data[i], data[i + 1], data[i + 2], data[i + 3],
      bgR, bgG, bgB,
    )
  }

  await sharp(data, { raw: info })
    .png({ compressionLevel: 9 })
    .trim({ threshold: 1 })
    .toFile(input + '.tmp')

  // Atomic replace.
  const { rename } = await import('node:fs/promises')
  await rename(input + '.tmp', input)

  console.log(`✓ ${name}  bg=rgb(${bgR},${bgG},${bgB})`)
}
console.log('Done.')
