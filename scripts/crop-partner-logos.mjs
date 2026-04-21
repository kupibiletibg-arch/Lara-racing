import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIR = resolve(__dirname, '../public/partners')

// Partners whose logos came from the combined light-on-dark + dark-on-light
// PDFs. We keep only the top (dark-background) half. Tile crop: full width,
// top 50% of the canvas, then trim transparent/solid borders.
const KEEP_TOP_HALF = new Set([
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
])

const entries = await readdir(DIR)
for (const name of entries) {
  if (!KEEP_TOP_HALF.has(name)) continue
  const path = join(DIR, name)
  const img = sharp(path)
  const meta = await img.metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0
  if (!width || !height) continue
  const cropped = await sharp(path)
    .extract({ left: 0, top: 0, width, height: Math.floor(height / 2) })
    .trim({ threshold: 10 })
    .toBuffer()
  await sharp(cropped).toFile(path)
  const s = await stat(path)
  console.log(`✓ ${name}  (${width}×${Math.floor(height / 2)} → trimmed, ${Math.round(s.size / 1024)}KB)`)
}
console.log('Done.')
