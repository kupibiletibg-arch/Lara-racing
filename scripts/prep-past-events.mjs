import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SRC_DIR = '/Users/Aleks/Desktop/А1 отминали'
const OUT = `${ROOT}/public/events`

// Full GD Racing poster (850 × 850) → gd-racing.webp
await sharp(`${SRC_DIR}/0-02-05-2fb9c420f56baac6829b517f155a31985fee7693a34fde0d25b7795ef874263c_221c2c25e28.jpg`)
  .webp({ quality: 88, lossless: false })
  .toFile(`${OUT}/gd-racing-2026-04.webp`)
console.log('✓ gd-racing-2026-04.webp')

// Top half of combined poster (BMW Cup 2026) → bmw-cup-2026.webp
await sharp(`${SRC_DIR}/0-02-05-3271eb87dab83dab62261d32774f5051f4f6ce29fdd8dcf35723fcd2d7f7044e_221c2c096f7.jpg`)
  .extract({ left: 0, top: 0, width: 850, height: 400 })
  .resize({ width: 850, height: 850, fit: 'cover', position: 'top' })
  .webp({ quality: 88 })
  .toFile(`${OUT}/bmw-cup-2026.webp`)
console.log('✓ bmw-cup-2026.webp')

// Bottom half (BES 999) → bes-999-2026.webp
await sharp(`${SRC_DIR}/0-02-05-3271eb87dab83dab62261d32774f5051f4f6ce29fdd8dcf35723fcd2d7f7044e_221c2c096f7.jpg`)
  .extract({ left: 0, top: 400, width: 850, height: 450 })
  .resize({ width: 850, height: 850, fit: 'cover', position: 'center' })
  .webp({ quality: 88 })
  .toFile(`${OUT}/bes-999-2026.webp`)
console.log('✓ bes-999-2026.webp')

console.log('Done.')
