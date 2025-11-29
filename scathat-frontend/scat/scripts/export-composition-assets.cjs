/*
 * Export professional design composition using provided logo
 * Outputs:
 * - SVG compositions (1920x1080) with and without background
 * - PNG compositions at 1920x1080, 300 DPI, sRGB
 */

const { writeFileSync, mkdirSync, readFileSync } = require("node:fs")
const { join } = require("node:path")
const sharp = require("sharp")

const OUT_DIR = join(process.cwd(), "public/brand")
mkdirSync(OUT_DIR, { recursive: true })

const W = 1920
const H = 1080
const MARGIN = Math.round(Math.min(W, H) * 0.20) // 20% margin

function compositionSvg({ transparent = false } = {}) {
  // Load logo SVG and embed it as nested <svg> to retain gradients and filters
  const logoPath = join(OUT_DIR, "logo-scathat.svg")
  const logoSvg = readFileSync(logoPath, "utf-8")
  // Determine logo render box keeping original aspect ratio (square 100x100 viewBox)
  const usableW = W - MARGIN * 2
  const usableH = H - MARGIN * 2
  const size = Math.min(usableW, usableH) // max square size allowed
  const x = Math.round((W - size) / 2)
  const y = Math.round((H - size) / 2)

  const bg = transparent
    ? ""
    : `
    <defs>
      <linearGradient id="comp-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b1226"/>
        <stop offset="100%" stop-color="#0f1b34"/>
      </linearGradient>
      <radialGradient id="comp-glow" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="rgba(20,184,166,0.12)"/>
        <stop offset="100%" stop-color="rgba(6,182,212,0.02)"/>
      </radialGradient>
      <filter id="softNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="noise"/>
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"/>
      </filter>
      <filter id="largeBlur">
        <feGaussianBlur stdDeviation="60"/>
      </filter>
    </defs>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#comp-bg)"/>
    <circle cx="${W * 0.75}" cy="${H * 0.25}" r="${Math.min(W,H) * 0.35}" fill="url(#comp-glow)" filter="url(#largeBlur)"/>
    <circle cx="${W * 0.25}" cy="${H * 0.75}" r="${Math.min(W,H) * 0.32}" fill="rgba(6,182,212,0.08)" filter="url(#largeBlur)"/>
    <rect x="0" y="0" width="${W}" height="${H}" filter="url(#softNoise)"/>
    <g opacity="0.08">
      <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
        <path d="M64 0H0V64" stroke="rgba(20,184,166,0.35)" stroke-width="1"/>
      </pattern>
      <rect x="${MARGIN/2}" y="${MARGIN/2}" width="${W - MARGIN}" height="${H - MARGIN}" fill="url(#grid)"/>
    </g>
  `

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      bg +
      // Centered logo with 20% margin preserved
      `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 100 100">` +
        logoSvg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "") +
      `</svg>` +
    `</svg>`
  )
}

function writeAssets() {
  const svgPath = join(OUT_DIR, "composition-1920x1080.svg")
  const svgTransparentPath = join(OUT_DIR, "composition-1920x1080-transparent.svg")
  const pngPath = join(OUT_DIR, "composition-1920x1080.png")
  const pngTransparentPath = join(OUT_DIR, "composition-1920x1080-transparent.png")

  const svgContent = compositionSvg({ transparent: false })
  const svgTransparent = compositionSvg({ transparent: true })

  writeFileSync(svgPath, svgContent, "utf-8")
  writeFileSync(svgTransparentPath, svgTransparent, "utf-8")

  // Rasterize to PNG at sRGB with 300 DPI
  sharp(Buffer.from(svgContent))
    .png({ compressionLevel: 9 })
    .withMetadata({ density: 300 })
    .toFile(pngPath)
    .then(() => console.log("✅ Wrote:", pngPath))
    .catch((e) => console.error("PNG export error:", e))

  sharp(Buffer.from(svgTransparent))
    .png({ compressionLevel: 9 })
    .withMetadata({ density: 300 })
    .toFile(pngTransparentPath)
    .then(() => console.log("✅ Wrote:", pngTransparentPath))
    .catch((e) => console.error("PNG export error:", e))
}

writeAssets()

