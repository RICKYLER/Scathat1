const { writeFileSync, mkdirSync } = require("node:fs")
const { join } = require("node:path")

function svgString(widthPx, heightPx) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}">` +
    `<defs>` +
    `<linearGradient id="frame-g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="#10b981"/>` +
    `<stop offset="100%" stop-color="#06b6d4"/>` +
    `</linearGradient>` +
    `<radialGradient id="logo-g" cx="50%" cy="50%" r="60%">` +
    `<stop offset="0%" stop-color="#2dd4bf"/>` +
    `<stop offset="100%" stop-color="#22d3ee"/>` +
    `</radialGradient>` +
    `</defs>` +
    `<rect x="0" y="0" width="${widthPx}" height="${heightPx}" fill="#0f172a"/>` +
    `<rect x="300" y="300" width="${widthPx - 600}" height="${heightPx - 600}" rx="${Math.round(Math.min(widthPx, heightPx) * 0.04)}" fill="none" stroke="url(#frame-g)" stroke-width="600"/>` +
    `<circle cx="${widthPx / 2}" cy="${heightPx / 2 - Math.min(heightPx, widthPx) * 0.06}" r="${Math.round(Math.min(heightPx, widthPx) * 0.22)}" fill="url(#logo-g)"/>` +
    `<g transform="translate(${widthPx / 2}, ${heightPx / 2 - Math.min(heightPx, widthPx) * 0.06})">` +
      `<polygon points="0,-23 -19,-9 -10,21 0,30 10,21 19,-9" fill="#0b1020" />` +
      `<ellipse cx="0" cy="4" rx="12" ry="7" fill="#ffffff" />` +
      `<circle cx="0" cy="4" r="6" fill="#e11d48" />` +
      `<circle cx="0" cy="4" r="3.2" fill="#0f172a" />` +
      `<circle cx="1.4" cy="2.6" r="1.2" fill="#ffffff" opacity="0.85" />` +
      `<g transform="rotate(-8)">` +
        `<ellipse cx="0" cy="-26" rx="22" ry="3.5" fill="#0f172a" opacity="0.95" />` +
        `<polygon points="-9,-34 9,-34 14,-27 -14,-27" fill="#0f172a" />` +
        `<rect x="-18" y="-31" width="36" height="4.5" fill="#ffffff" />` +
      `</g>` +
    `</g>` +
    `<text x="${widthPx / 2}" y="${heightPx / 2 + Math.min(heightPx, widthPx) * 0.22 + Math.min(heightPx, widthPx) * 0.08}" text-anchor="middle" font-size="${Math.round(Math.min(widthPx, heightPx) * 0.12)}" font-weight="800" fill="url(#frame-g)">Scathat</text>` +
    `</svg>`
  )
}

const outDir = join(process.cwd(), "public/brand")
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, "logo-framed-header.svg"), svgString(1920, 1920), "utf-8")
writeFileSync(join(outDir, "logo-framed-36in.svg"), svgString(10800, 10800), "utf-8")
writeFileSync(join(outDir, "logo-framed-8ft.svg"), svgString(14400, 14400), "utf-8")
console.log("Exported SVGs to public/brand")
