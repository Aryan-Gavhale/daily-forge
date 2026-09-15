import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/**
 * Rasterises the app icon. Run with `npm run icons` after editing
 * public/icons/icon.svg.
 *
 * The maskable variant gets its own source because Android crops icons to an
 * arbitrary mask and only the inner 80% is guaranteed to survive.
 */

const here = dirname(fileURLToPath(import.meta.url))
const iconsDir = resolve(here, '../public/icons')

const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1b1b21"/><stop offset="100%" stop-color="#08080a"/>
    </linearGradient>
    <linearGradient id="flame" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#ffc26b"/><stop offset="42%" stop-color="#ff7a1a"/><stop offset="100%" stop-color="#e2590a"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(0.66) translate(-256 -256)">
    <path fill="url(#flame)" d="M256 78c0 0 128 104 128 216a128 128 0 0 1-256 0c0-40 15-76 36-106 5 38 25 61 51 61 33 0 48-30 48-76 0-43-7-79-7-95Z"/>
    <path fill="#08080a" fill-opacity="0.55" d="M256 254c0 0 56 46 56 94a56 56 0 0 1-112 0c0-48 56-94 56-94Z"/>
  </g>
</svg>`

async function main() {
  await mkdir(iconsDir, { recursive: true })
  const source = await readFile(resolve(iconsDir, 'icon.svg'))

  const targets = [
    { name: 'icon-192.png', size: 192, svg: source },
    { name: 'icon-512.png', size: 512, svg: source },
    { name: 'apple-touch-icon.png', size: 180, svg: source },
    { name: 'favicon-32.png', size: 32, svg: source },
    { name: 'icon-maskable-512.png', size: 512, svg: Buffer.from(MASKABLE_SVG) },
  ]

  for (const t of targets) {
    const buf = await sharp(t.svg, { density: 512 })
      .resize(t.size, t.size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toBuffer()
    await writeFile(resolve(iconsDir, t.name), buf)
    console.log(`  ${t.name.padEnd(26)} ${t.size}x${t.size}  ${(buf.length / 1024).toFixed(1)} KB`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
