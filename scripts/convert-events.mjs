#!/usr/bin/env node
// Convert raw event posters (JPG/PNG) → lossless WebP.
// Input:  public/events/raw/*.{jpg,jpeg,png,webp}
// Output: public/events/<same-basename>.webp (lossless, metadata stripped)
//
// Run:    npm run convert-events
//
// Why lossless: posters have sharp type + flat color regions; lossy WebP would
// smear the text. Lossless WebP at q=100 is still much smaller than source JPEG
// in most cases because it de-duplicates the flat backgrounds.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const RAW_DIR = 'public/events/raw'
const OUT_DIR = 'public/events'

if (!fs.existsSync(RAW_DIR)) {
  console.error(`missing input dir: ${RAW_DIR}`)
  process.exit(1)
}

const inputs = fs
  .readdirSync(RAW_DIR)
  .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  .filter(f => !f.startsWith('.'))

if (inputs.length === 0) {
  console.error('no raw posters found in', RAW_DIR)
  console.error('drop .jpg/.png files into that folder and re-run.')
  process.exit(1)
}

for (const file of inputs) {
  const src = path.join(RAW_DIR, file)
  const base = file.replace(/\.[^.]+$/, '')
  const dst = path.join(OUT_DIR, `${base}.webp`)
  const { size: srcSize } = fs.statSync(src)
  await sharp(src)
    .rotate() // auto-orient from EXIF
    .webp({ lossless: true, effort: 6 })
    .toFile(dst)
  const { size: dstSize } = fs.statSync(dst)
  const ratio = ((1 - dstSize / srcSize) * 100).toFixed(1)
  console.log(`✓ ${file} → ${base}.webp  ${(srcSize / 1024).toFixed(0)}KB → ${(dstSize / 1024).toFixed(0)}KB (${ratio}% smaller)`)
}
