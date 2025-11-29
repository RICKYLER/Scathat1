"use client"

import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, useSpring } from "framer-motion"
import { useEffect, useState } from "react"

type AnimatedBackgroundProps = {
  accentRGB?: [number, number, number]
  secondaryRGB?: [number, number, number]
  strength?: number
  noiseAlpha?: number
  vignetteAlpha?: number
  enableVignette?: boolean
  preset?: "pro" | "brand" | "violetCyan" | "emeraldCyan" | "aurora" | "metalTech"
  enableGrid?: boolean
  gridSpacing?: number
  gridAlpha?: number
}

export function AnimatedBackground(props: AnimatedBackgroundProps = {}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true)
  const [presetState] = useState<"pro" | "brand" | "violetCyan" | "emeraldCyan" | "aurora" | "metalTech">(props.preset ?? "brand")

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Only use motion hooks if not in reduced motion mode
  const { scrollY } = useScroll()
  const easedScroll = useSpring(scrollY, { stiffness: 220, damping: 28, mass: 0.8 })
  const topGradientY = useTransform(easedScroll, [0, 600], [0, -140])
  const heroGradientX = useTransform(easedScroll, [0, 600], [0, 90])
  const heroGradientY = useTransform(easedScroll, [0, 600], [0, -120])
  const middleGradientY = useTransform(easedScroll, [0, 1400], [0, 180])
  const bottomGradientX = useTransform(easedScroll, [400, 2000], [0, -120])

  const topY = useSpring(topGradientY, { stiffness: 160, damping: 28, mass: 1 })
  const heroX = useSpring(heroGradientX, { stiffness: 160, damping: 28, mass: 1 })
  const heroY = useSpring(heroGradientY, { stiffness: 160, damping: 28, mass: 1 })
  const middleY = useSpring(middleGradientY, { stiffness: 160, damping: 28, mass: 1 })
  const bottomX = useSpring(bottomGradientX, { stiffness: 160, damping: 28, mass: 1 })

  // Mouse movement tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return
    
    const { clientX, clientY } = e
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0
    
    mouseX.set((clientX - centerX) / 20)
    mouseY.set((clientY - centerY) / 20)
  }

  const mouseGradientX = useTransform(mouseX, [-500, 500], [-24, 24])
  const mouseGradientY = useTransform(mouseY, [-500, 500], [-24, 24])

   const metalParallaxX = useSpring(useTransform(mouseGradientX, [-24, 24], [-16, 16]), { stiffness: 160, damping: 28, mass: 1 })
  const metalParallaxY = useSpring(useTransform(mouseGradientY, [-24, 24], [-10, 10]), { stiffness: 160, damping: 28, mass: 1 })

  const preset = presetState
  const strength = props.strength ?? 1
  const noiseAlpha = props.noiseAlpha ?? 0.004
  const vignetteAlpha = props.vignetteAlpha ?? 0.14
  const enableVignette = props.enableVignette ?? true

  let accent: [number, number, number]
  let secondary: [number, number, number]
  switch (preset) {
    case "brand":
      accent = props.accentRGB ?? [16, 185, 129] // emerald-500
      secondary = props.secondaryRGB ?? [6, 182, 212] // cyan-500
      break
    case "violetCyan":
      accent = props.accentRGB ?? [124, 58, 237]
      secondary = props.secondaryRGB ?? [6, 182, 212]
      break
    case "emeraldCyan":
      accent = props.accentRGB ?? [34, 197, 94]
      secondary = props.secondaryRGB ?? [22, 163, 74]
      break
    case "aurora":
      accent = props.accentRGB ?? [99, 102, 241] // indigo
      secondary = props.secondaryRGB ?? [6, 182, 212] // cyan
      break
    case "metalTech":
      accent = props.accentRGB ?? [120, 124, 130] // steel mid
      secondary = props.secondaryRGB ?? [30, 41, 59] // slate
      break
    case "pro":
    default:
      accent = props.accentRGB ?? [20, 184, 166]
      secondary = props.secondaryRGB ?? [6, 182, 212]
      break
  }

  const enableGrid = props.enableGrid ?? true
  const gridSpacing = Math.max(24, props.gridSpacing ?? 64)
  const gridAlpha = Math.max(0, Math.min(0.15, props.gridAlpha ?? 0.06))

  const rgba = (rgb: [number, number, number], a: number) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`
  const topColor = rgba(accent, 0.045 * strength)
  const heroColor = rgba(accent, 0.06 * strength)
  const middleColor = rgba(secondary, 0.035 * strength)
  const bottomColor = rgba(accent, 0.04 * strength)
  const heroFocusColor = rgba(accent, preset === "metalTech" ? 0.08 * strength : 0.12 * strength)
  const auroraStart = rgba([99, 102, 241], preset === "aurora" ? 0.18 * strength : 0.12 * strength)
  const auroraEnd = rgba([6, 182, 212], preset === "aurora" ? 0.16 * strength : 0.10 * strength)

  const sectionColor = useTransform(
    easedScroll,
    [0, 600, 1400, 2200],
    [
      rgba(accent, 0.035 * strength),
      rgba(accent, 0.045 * strength),
      rgba(secondary, 0.06 * strength),
      rgba(accent, 0.05 * strength)
    ]
  )

  const combinedHeroX = useMotionTemplate`calc(${mouseGradientX}px + ${heroX}px)`
  const combinedHeroY = useMotionTemplate`calc(${mouseGradientY}px + ${heroY}px)`

  return (
    <motion.div 
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ cursor: 'none' }}
    >
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] rounded-full blur-3xl"
        style={{ y: prefersReducedMotion ? 0 : topY, willChange: 'transform', backgroundColor: topColor }}
        animate={{
          opacity: [0.06, 0.09, 0.06],
          scale: [1, 1.06, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-1/4 right-1/5 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ 
          x: prefersReducedMotion ? 0 : heroX,
          y: prefersReducedMotion ? 0 : heroY,
          willChange: 'transform',
          backgroundColor: heroColor
        }}
        animate={{
          opacity: [0.08, 0.1, 0.08],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      <motion.div
        className="absolute top-2/3 left-1/6 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ y: prefersReducedMotion ? 0 : middleY, willChange: 'transform', backgroundColor: middleColor }}
        animate={{
          opacity: [0.05, 0.07, 0.05],
          scale: [1, 1.04, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/5 w-[700px] h-[700px] rounded-full blur-3xl"
        style={{ x: prefersReducedMotion ? 0 : bottomX, willChange: 'transform', backgroundColor: bottomColor }}
        animate={{
          opacity: [0.06, 0.08, 0.06],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6
        }}
      />

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl"
        style={{
          x: prefersReducedMotion ? 0 : combinedHeroX,
          y: prefersReducedMotion ? 0 : combinedHeroY,
          willChange: 'transform',
          backgroundColor: heroFocusColor
        }}
        animate={{
          opacity: [0.12, 0.18, 0.12],
          scale: [1, 1.12, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Aurora overlay ribbon */}
      {preset !== "metalTech" && (
        <motion.div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[240px] blur-2xl"
          style={{
            backgroundImage: `linear-gradient(90deg, ${auroraStart}, ${auroraEnd})`,
            opacity: prefersReducedMotion ? 0.08 : 0.16,
            willChange: 'transform'
          }}
          animate={{
            transform: prefersReducedMotion ? 'none' : ['translateX(-2%) rotate(-3deg)', 'translateX(2%) rotate(3deg)', 'translateX(-2%) rotate(-3deg)']
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <motion.div
        className="absolute inset-0"
        style={{
          backgroundColor: prefersReducedMotion ? 'transparent' : sectionColor
        }}
      />

      <motion.div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          opacity: noiseAlpha,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {enableGrid && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${rgba(accent, gridAlpha)} 1px, transparent 1px),
              linear-gradient(to bottom, ${rgba(accent, gridAlpha)} 1px, transparent 1px),
              linear-gradient(to right, ${rgba(accent, gridAlpha * 1.2)} 2px, transparent 2px),
              linear-gradient(to bottom, ${rgba(accent, gridAlpha * 1.2)} 2px, transparent 2px)
            `,
            backgroundSize: `
              ${gridSpacing}px ${gridSpacing}px,
              ${gridSpacing}px ${gridSpacing}px,
              ${gridSpacing * 4}px ${gridSpacing * 4}px,
              ${gridSpacing * 4}px ${gridSpacing * 4}px
            `,
            backgroundPosition: 'center'
          }}
        />
      )}

      {preset === "metalTech" ? (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0%, transparent 42%),
                                radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 40%),
                                linear-gradient(135deg, rgba(255,255,255,0.045), rgba(0,0,0,0.09))`,
              mixBlendMode: 'overlay',
              x: prefersReducedMotion ? 0 : metalParallaxX,
              y: prefersReducedMotion ? 0 : metalParallaxY
            }}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(20deg, ${rgba(accent, 0.06)} 0px, ${rgba(accent, 0.06)} 1px, transparent 1px, transparent 18px)`,
              opacity: prefersReducedMotion ? 0.05 : 0.12,
              mixBlendMode: 'soft-light',
              x: prefersReducedMotion ? 0 : metalParallaxX,
              y: prefersReducedMotion ? 0 : metalParallaxY
            }}
            animate={{ backgroundPosition: prefersReducedMotion ? '0px 0px' : ['0px 0px', '64px 32px', '0px 0px'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute top-1/2 left-0 -translate-y-1/2 w-[1600px] h-[260px] blur-2xl"
            style={{
              backgroundImage: `linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)`,
              mixBlendMode: 'screen',
              opacity: prefersReducedMotion ? 0.08 : 0.18,
              rotate: -8
            }}
            animate={{ x: prefersReducedMotion ? 0 : [-420, 420, -420] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      ) : (
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${rgba(accent, 0.08)} 0px, ${rgba(accent, 0.08)} 2px, transparent 2px, transparent 24px)`,
            opacity: prefersReducedMotion ? 0.05 : 0.1
          }}
          animate={{
            backgroundPosition: prefersReducedMotion ? '0px 0px' : ['0px 0px', '48px 24px', '0px 0px']
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {enableVignette && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignetteAlpha}) 100%)`
          }}
        />
      )}

      {/* Preset toggle removed to ensure background consistency */}
    </motion.div>
  )
}
