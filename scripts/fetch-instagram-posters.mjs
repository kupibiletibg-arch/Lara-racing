#!/usr/bin/env node
// One-shot helper: for each reel in lib/data/instagramPosts.ts fetch the
// permalink, extract `<meta property="og:image">` and save the resulting
// image as `public/social/<SHORTCODE>.jpg` (sharp re-encodes to JPEG q=82).
//
//   node scripts/fetch-instagram-posters.mjs
//
// Run this whenever the Instagram posts list changes. The saved bytes are
// committed so production doesn't depend on IG's short-lived signed CDN
// URLs.

import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/social')

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// Permalinks mirror lib/data/instagramPosts.ts — kept in sync by hand so the
// helper has zero runtime deps on the TS source.
const PERMALINKS = [
  'https://www.instagram.com/reel/DWlju3GDaJw/',
  'https://www.instagram.com/reel/DXbTzALNMyx/',
  'https://www.instagram.com/reel/DXYq_57NyT1/',
  'https://www.instagram.com/reel/DXW7lG4Nl6N/',
  'https://www.instagram.com/reel/DXWuspSiILJ/',
]

function shortcodeOf(permalink) {
  const match = /\/(p|reel|tv)\/([^/?#]+)/.exec(permalink)
  return match ? match[2] : null
}

async function extractOgImage(html) {
  // <meta property="og:image" content="…"> — IG uses double quotes.
  const re =
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  const m = re.exec(html)
  if (m) return decodeEntities(m[1])
  // Fallback: same attrs reversed.
  const re2 =
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
  const m2 = re2.exec(html)
  return m2 ? decodeEntities(m2[1]) : null
}

function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  for (const permalink of PERMALINKS) {
    const code = shortcodeOf(permalink)
    if (!code) {
      console.log(`✗ ${permalink} · unrecognised permalink shape`)
      continue
    }
    try {
      const htmlRes = await fetch(permalink, {
        headers: {
          'User-Agent': UA,
          Accept: 'text/html,application/xhtml+xml',
        },
      })
      if (!htmlRes.ok) {
        console.log(`✗ ${code} · HTML ${htmlRes.status}`)
        continue
      }
      const html = await htmlRes.text()
      const imgUrl = await extractOgImage(html)
      if (!imgUrl) {
        console.log(`✗ ${code} · og:image not found`)
        continue
      }
      const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': UA } })
      if (!imgRes.ok) {
        console.log(`✗ ${code} · IMG ${imgRes.status}`)
        continue
      }
      const buf = Buffer.from(await imgRes.arrayBuffer())
      const out = resolve(OUT_DIR, `${code}.jpg`)
      await sharp(buf).jpeg({ quality: 82, mozjpeg: true }).toFile(out)
      const bytes = (await import('node:fs/promises')).then(() => null)
      console.log(`✓ ${code} · ${(buf.length / 1024).toFixed(0)} KB source · saved`)
    } catch (err) {
      console.log(`✗ ${code} · ${err.message ?? err}`)
    }
  }
}

await main()
