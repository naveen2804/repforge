#!/usr/bin/env node
/** Renders the RepForge mark into the PNG icon sizes the manifest and iOS need. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = path.join(root, 'public', 'icons')
fs.mkdirSync(iconsDir, { recursive: true })

/** The mark: a stylised barbell on the brand gradient. `inset` leaves a maskable safe zone. */
const mark = (size, inset) => {
  const s = size
  const pad = s * inset
  const w = s - pad * 2
  const bar = w * 0.052
  const cy = s / 2
  const plateH = w * 0.46
  const plateW = w * 0.115
  const innerH = w * 0.3
  const innerW = w * 0.085
  const x0 = pad
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f97316"/><stop offset="55%" stop-color="#ef4444"/><stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" rx="${s * 0.22}" fill="url(#g)"/>
  <g fill="#fff">
    <rect x="${x0 + w * 0.16}" y="${cy - bar / 2}" width="${w * 0.68}" height="${bar}" rx="${bar / 2}"/>
    <rect x="${x0}" y="${cy - plateH / 2}" width="${plateW}" height="${plateH}" rx="${plateW * 0.34}"/>
    <rect x="${x0 + w - plateW}" y="${cy - plateH / 2}" width="${plateW}" height="${plateH}" rx="${plateW * 0.34}"/>
    <rect x="${x0 + plateW * 1.35}" y="${cy - innerH / 2}" width="${innerW}" height="${innerH}" rx="${innerW * 0.36}"/>
    <rect x="${x0 + w - plateW * 1.35 - innerW}" y="${cy - innerH / 2}" width="${innerW}" height="${innerH}" rx="${innerW * 0.36}"/>
  </g>
</svg>`
}

const targets = [
  ['icon-192.png', 192, 0.14],
  ['icon-512.png', 512, 0.14],
  ['icon-maskable-512.png', 512, 0.24],
  ['apple-touch-icon.png', 180, 0.12],
]

for (const [name, size, inset] of targets) {
  await sharp(Buffer.from(mark(size, inset))).png().toFile(path.join(iconsDir, name))
  console.log(`icons/${name}`)
}

fs.writeFileSync(path.join(root, 'public', 'favicon.svg'), mark(64, 0.1))
console.log('favicon.svg')
