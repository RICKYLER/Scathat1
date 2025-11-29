const { createCanvas } = require('canvas')
const { writeFileSync, mkdirSync } = require('fs')
const { join } = require('path')
const sharp = require('sharp')

function drawAurora(ctx, w, h) {
  const grd1 = ctx.createRadialGradient(w*0.5, h*0.4, 0, w*0.5, h*0.4, w*0.6)
  grd1.addColorStop(0, 'rgba(99,102,241,0.65)')
  grd1.addColorStop(1, 'rgba(6,182,212,0.20)')
  ctx.fillStyle = grd1
  ctx.fillRect(0,0,w,h)

  const grd2 = ctx.createRadialGradient(w*0.2, h*0.8, 0, w*0.2, h*0.8, w*0.5)
  grd2.addColorStop(0, 'rgba(34,197,94,0.5)')
  grd2.addColorStop(1, 'rgba(16,185,129,0.1)')
  ctx.fillStyle = grd2
  ctx.fillRect(0,0,w,h)

  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.beginPath()
  ctx.moveTo(0, h*0.6)
  ctx.quadraticCurveTo(w*0.4, h*0.55, w, h*0.7)
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()
}

function drawMetalTech(ctx, w, h) {
  const grd = ctx.createLinearGradient(0,0,w,h)
  grd.addColorStop(0, 'rgba(13,17,23,1)')
  grd.addColorStop(1, 'rgba(2,6,23,1)')
  ctx.fillStyle = grd
  ctx.fillRect(0,0,w,h)

  const highlight = ctx.createRadialGradient(w*0.25, h*0.3, 0, w*0.25, h*0.3, w*0.4)
  highlight.addColorStop(0, 'rgba(255,255,255,0.06)')
  highlight.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = highlight
  ctx.beginPath()
  ctx.arc(w*0.25, h*0.3, w*0.4, 0, Math.PI*2)
  ctx.fill()

  const highlight2 = ctx.createRadialGradient(w*0.75, h*0.7, 0, w*0.75, h*0.7, w*0.35)
  highlight2.addColorStop(0, 'rgba(255,255,255,0.05)')
  highlight2.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = highlight2
  ctx.beginPath()
  ctx.arc(w*0.75, h*0.7, w*0.35, 0, Math.PI*2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 2
  for (let i=0;i<8;i++) {
    ctx.beginPath()
    ctx.moveTo(w*0.1, h*(0.2 + i*0.08))
    ctx.lineTo(w*0.9, h*(0.18 + i*0.08))
    ctx.stroke()
  }
}

async function exportWebP(name, drawFn, w=1920, h=1080) {
  const canvas = createCanvas(w,h)
  const ctx = canvas.getContext('2d')
  drawFn(ctx, w, h)
  const buffer = canvas.toBuffer('image/png')
  const outDir = join(process.cwd(), 'public/backgrounds')
  mkdirSync(outDir, { recursive: true })
  const webp = await sharp(buffer).webp({ quality: 86 }).toBuffer()
  writeFileSync(join(outDir, `${name}-${w}x${h}.webp`), webp)
  const sm = await sharp(buffer).resize(1280, 720).webp({ quality: 84 }).toBuffer()
  writeFileSync(join(outDir, `${name}-1280x720.webp`), sm)
  console.log(`Exported ${name} backgrounds to public/backgrounds`)
}

;(async () => {
  await exportWebP('aurora', drawAurora)
  await exportWebP('metal', drawMetalTech)
})()

