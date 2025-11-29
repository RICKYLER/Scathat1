"use client"

import React from "react"

type LogoFramedProps = {
  widthPx?: number
  heightPx?: number
  borderInch?: number
  dpi?: number
  backgroundHex?: string
  frameGradientStart?: string
  frameGradientEnd?: string
  logoGradientStart?: string
  logoGradientEnd?: string
  decorative?: boolean
  frame?: boolean
  iconOnly?: boolean
  ringHex?: string
  ringPx?: number
}

export function LogoFramed({
  widthPx = 3000,
  heightPx = 3000,
  borderInch = 2,
  dpi = 300,
  backgroundHex = "transparent",
  frameGradientStart = "#10b981",
  frameGradientEnd = "#06b6d4",
  logoGradientStart = "#0b1226",
  logoGradientEnd = "#0f172a",
  decorative = true,
  frame = true,
  iconOnly = true,
  ringHex = "#ff5bd3",
  ringPx = Math.max(2, Math.round(Math.min(widthPx, heightPx) * 0.02)),
}: LogoFramedProps) {
  const borderPx = Math.max(1, Math.round(borderInch * dpi))
  const vbW = widthPx
  const vbH = heightPx
  const contentW = vbW - borderPx
  const contentH = vbH - borderPx
  const frameRadius = Math.round(Math.min(vbW, vbH) * 0.04)
  const logoCircleR = Math.round(Math.min(contentW, contentH) * 0.22)
  const logoCircleCx = vbW / 2
  const logoCircleCy = vbH / 2 - Math.min(vbH, vbW) * 0.06
  const wordmarkY = logoCircleCy + logoCircleR + Math.min(vbH, vbW) * 0.08
  const R = logoCircleR
  const shieldPoints = [
    [0, -0.5 * R],
    [-0.42 * R, -0.2 * R],
    [-0.22 * R, 0.45 * R],
    [0, 0.65 * R],
    [0.22 * R, 0.45 * R],
    [0.42 * R, -0.2 * R],
  ]
  const shieldPointsStr = shieldPoints.map(([x, y]) => `${x},${y}`).join(" ")
  const brimRx = 0.65 * R
  const brimRy = 0.1 * R
  const brimCx = 0
  const brimCy = -0.58 * R
  const bandW = 0.6 * R
  const bandH = 0.08 * R
  const bandX = -bandW / 2
  const bandY = -0.78 * R
  const crownPoints = [
    [-0.28 * R, -0.98 * R],
    [0.28 * R, -0.98 * R],
    [0.44 * R, -0.72 * R],
    [-0.44 * R, -0.72 * R],
  ]
  const crownPointsStr = crownPoints.map(([x, y]) => `${x},${y}`).join(" ")
  const eyeRx = 0.26 * R
  const eyeRy = 0.14 * R
  const eyeCx = 0
  const eyeCy = 0.06 * R
  const irisR = 0.12 * R
  const pupilR = 0.06 * R

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={widthPx}
      height={heightPx}
      viewBox={`0 0 ${vbW} ${vbH}`}
    >
      <defs>
        <linearGradient id="frame-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={frameGradientStart} />
          <stop offset="100%" stopColor={frameGradientEnd} />
        </linearGradient>
        <radialGradient id="logo-g" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={logoGradientStart} />
          <stop offset="100%" stopColor={logoGradientEnd} />
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={Math.max(6, Math.round(Math.min(vbW, vbH) * 0.006))} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x={0} y={0} width={vbW} height={vbH} fill={backgroundHex} />

      {frame && (
        <rect
          x={borderPx / 2}
          y={borderPx / 2}
          width={vbW - borderPx}
          height={vbH - borderPx}
          rx={frameRadius}
          ry={frameRadius}
          fill="none"
          stroke="url(#frame-g)"
          strokeWidth={borderPx}
        />
      )}

      {decorative && (
        <g filter="url(#softGlow)">
          <circle cx={logoCircleCx} cy={logoCircleCy} r={logoCircleR * 1.08} fill={logoGradientStart} opacity={0.08} />
          <circle cx={logoCircleCx} cy={logoCircleCy} r={logoCircleR * 1.2} fill={logoGradientEnd} opacity={0.06} />
        </g>
      )}

      <circle cx={logoCircleCx} cy={logoCircleCy} r={logoCircleR} fill="url(#logo-g)" />
      <circle cx={logoCircleCx} cy={logoCircleCy} r={logoCircleR} fill="none" stroke={ringHex} strokeWidth={ringPx} />

      <g transform={`translate(${logoCircleCx},${logoCircleCy})`}>
        <polygon points={shieldPointsStr} fill="#0b1020" />

        <ellipse cx={eyeCx} cy={eyeCy} rx={eyeRx} ry={eyeRy} fill="#ffffff" />
        <circle cx={eyeCx} cy={eyeCy} r={irisR} fill="#e11d48" />
        <circle cx={eyeCx} cy={eyeCy} r={pupilR} fill="#0f172a" />
        <circle cx={eyeCx + pupilR * 0.4} cy={eyeCy - pupilR * 0.4} r={pupilR * 0.25} fill="#ffffff" opacity={0.85} />

        <g transform={`rotate(-8)`}>
          <ellipse cx={brimCx} cy={brimCy} rx={brimRx} ry={brimRy} fill="#0f172a" opacity={0.95} />
          <polygon points={crownPointsStr} fill="#0f172a" />
          <rect x={bandX} y={bandY} width={bandW} height={bandH} fill="#ffffff" />
        </g>
      </g>

      {iconOnly ? null : (
        <text
          x={vbW / 2}
          y={wordmarkY}
          textAnchor="middle"
          fontSize={Math.round(Math.min(vbW, vbH) * 0.12)}
          fontWeight={800}
          fill="url(#frame-g)"
        >
          Scathat
        </text>
      )}
    </svg>
  )
}
