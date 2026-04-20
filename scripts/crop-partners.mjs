import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DESKTOP = '/Users/Aleks/Desktop/A1 Motor Park'

const SRC = `${DESKTOP}/0-02-05-a729e3ea84de287af069a81a42534fd1991350162fa1995289e303b000b3cf22_221c6f6cc9f.png`
const OUT_DIR = `${ROOT}/public/partners`

// Visual layout in 1150×240 — NOT a regular grid:
//   Top row (y 0–95):   [pulse][premium][A1 (centre, skipped)][speed-sec][falcon]
//   Mid row (y 90–155): [                ][super-cars-run      ][margel]
//   Bot row (y 140–240):[red-zone][justpablo][gumi7      ][mirafiori]
const CROPS = [
  { slug: 'pulse',          left:   5, top:  10, width: 180, height:  75 },
  { slug: 'premium-rally',  left: 195, top:   0, width: 200, height:  98 },
  { slug: 'speed-sector',   left: 698, top:   0, width: 145, height: 130 },
  { slug: 'rally-falcon',   left: 850, top:  10, width: 200, height:  80 },
  { slug: 'super-cars-run', left: 420, top:  90, width: 290, height:  60 },
  { slug: 'margel',         left: 880, top: 100, width: 245, height:  60 },
  { slug: 'red-zone',       left:   0, top: 140, width: 225, height:  95 },
  { slug: 'justpablo',      left: 235, top: 158, width: 240, height:  55 },
  { slug: 'gumi7',          left: 495, top: 150, width: 230, height:  90 },
  { slug: 'mirafiori',      left: 895, top: 158, width: 240, height:  80 },
]

await mkdir(OUT_DIR, { recursive: true })

const meta = await sharp(SRC).metadata()
console.log(`Source: ${meta.width}×${meta.height}`)

for (const c of CROPS) {
  await sharp(SRC)
    .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
    .toFile(`${OUT_DIR}/${c.slug}.png`)
  console.log(`✓ ${c.slug}.png (${c.width}×${c.height})`)
}
console.log('Done.')
