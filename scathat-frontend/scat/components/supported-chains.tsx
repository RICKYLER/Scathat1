"use client"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations/variants"
import { useEffect, useRef, useState } from "react"

const chains = [
  {
    name: "Base",
    svg: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#0052FF" />
        <rect x="6" y="11" width="9" height="2" rx="1" fill="#ffffff" />
      </svg>
    ),
    highlight: true,
  },
  {
    name: "Ethereum",
    svg: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l-8 10 8 4 8-4-8-10z" fill="#627EEA" />
        <path d="M12 22l-7-9 7 3 7-3-7 9z" fill="#627EEA" opacity=".85" />
      </svg>
    ),
  },
  {
    name: "Arbitrum",
    svg: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" fill="#2D3748" />
        <path d="M6 9h8l4 6H10L6 9z" fill="#00A3FF" />
      </svg>
    ),
  },
  {
    name: "Optimism",
    svg: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#FF0420" />
      </svg>
    ),
  },
  {
    name: "Polygon",
    svg: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 12l4-6 4 6-4 6-4-6z" fill="#8247E5" />
      </svg>
    ),
  },
  {
    name: "Solana",
    svg: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 8l3-2h9l-3 2H6zM6 13l3-2h9l-3 2H6zM6 18l3-2h9l-3 2H6z" fill="#14F195" />
      </svg>
    ),
  },
]

type SupportedChainsProps = {
  speed?: number
  highlightMs?: number
  fillMs?: number
  loadDelayMs?: number
  loadDurationMs?: number
  accentRGB?: [number, number, number]
  accentFillAlpha?: number
  accentLoadAlpha?: number
  pauseOffscreen?: boolean
  sweepDurationMs?: number
  pulseDurationMs?: number
}

export function SupportedChains(props: SupportedChainsProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const activeUntil = useRef<Map<number, number>>(new Map())
  const [activeVersion, setActiveVersion] = useState(0)
  const [chainFillActive, setChainFillActive] = useState<number | null>(null)
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)
  const lastCenterIdx = useRef<number | null>(null)
  const fillTimeout = useRef<number | null>(null)
  const speed = props.speed ?? 0.6
  const fillMs = props.fillMs ?? 450
  const loadDelayMs = props.loadDelayMs ?? 250
  const highlightMs = props.highlightMs ?? 10000
  const loadDurationMs = props.loadDurationMs ?? 1200
  const accentRGB = props.accentRGB ?? [0, 242, 139]
  const accentFillAlpha = props.accentFillAlpha ?? 0.22
  const accentLoadAlpha = props.accentLoadAlpha ?? 0.18
  const pauseOffscreen = props.pauseOffscreen ?? true
  const accentFill = `rgba(${accentRGB[0]},${accentRGB[1]},${accentRGB[2]},${accentFillAlpha})`
  const accentLoad = `rgba(${accentRGB[0]},${accentRGB[1]},${accentRGB[2]},${accentLoadAlpha})`
  const sweepDurationMs = props.sweepDurationMs ?? 9000
  const pulseDurationMs = props.pulseDurationMs ?? 3200
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let rafId: number | null = null
    let lastCheck = 0
    const step = () => {
      if (pauseOffscreen && !inView) {
        rafId = requestAnimationFrame(step)
        return
      }
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) {
        rafId = requestAnimationFrame(step)
        return
      }
      const next = el.scrollLeft + speed
      el.scrollLeft = next >= max ? 0 : next

      const now = performance.now()
      if (now - lastCheck > 120) {
        lastCheck = now
        const containerRect = el.getBoundingClientRect()
        const centerX = containerRect.left + containerRect.width / 2
        const track = trackRef.current
        if (track) {
          const children = Array.from(track.children) as HTMLElement[]
          let closest = -1
          let closestDist = Infinity
          let closestW = 0
          for (let i = 0; i < children.length; i++) {
            const r = children[i].getBoundingClientRect()
            const cx = r.left + r.width / 2
            const d = Math.abs(cx - centerX)
            if (d < closestDist) {
              closestDist = d
              closest = i
              closestW = r.width
            }
          }
          if (closest !== -1 && closestDist <= closestW * 0.5) {
            const until = Date.now() + highlightMs
            const prev = activeUntil.current.get(closest) || 0
            if (until > prev) {
              activeUntil.current.set(closest, until)
              setActiveVersion((v) => v + 1)
            }
            if (lastCenterIdx.current !== closest) {
              lastCenterIdx.current = closest
              setChainFillActive(closest)
              if (fillTimeout.current) window.clearTimeout(fillTimeout.current)
              fillTimeout.current = window.setTimeout(() => {
                setChainFillActive(null)
                window.setTimeout(() => {
                  setLoadingIdx(closest)
                }, loadDelayMs)
              }, fillMs)
            }
          }
          if (closest === -1 || closestDist > closestW * 0.5) {
            setLoadingIdx(null)
          }
          let changed = false
          const ts = Date.now()
          for (const [k, val] of activeUntil.current) {
            if (val <= ts) {
              activeUntil.current.delete(k)
              changed = true
            }
          }
          if (changed) setActiveVersion((v) => v + 1)
        }
      }
      rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    const ro = new ResizeObserver(() => {
      const max = el.scrollWidth - el.clientWidth
      el.scrollLeft = Math.min(el.scrollLeft, Math.max(0, max))
    })
    ro.observe(el)
    const mo = new MutationObserver(() => {
      const max = el.scrollWidth - el.clientWidth
      if (max > 0) el.scrollTo({ left: max, behavior: "smooth" })
    })
    if (trackRef.current) mo.observe(trackRef.current, { childList: true })
    let io: IntersectionObserver | null = null
    if (pauseOffscreen) {
      io = new IntersectionObserver((entries) => {
        const e = entries[0]
        setInView(!!e?.isIntersecting)
      }, { threshold: 0.1 })
      if (containerRef.current) io.observe(containerRef.current)
    }
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      ro.disconnect()
      mo.disconnect()
      if (io) io.disconnect()
    }
  }, [pauseOffscreen, inView, speed, highlightMs, fillMs, loadDelayMs])

  return (
    <motion.section
      className="flex w-full flex-col items-center justify-center gap-8 px-6 py-16 relative z-10"
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={staggerContainer}
    >
      <motion.div
        className="flex w-full max-w-[1024px] flex-col items-center gap-8 px-8 py-8"
        variants={fadeInUp}
      >
        <span className="text-[12px] font-[500] leading-[16px] text-muted-foreground uppercase tracking-wider">
          SUPPORTED CHAINS
        </span>

        <div
          ref={containerRef}
          className="chains-scroll relative w-full overflow-x-hidden scroll-smooth rounded-2xl px-4 py-4 shadow-[0_0_28px_rgba(0,242,139,0.16)] border border-white/10 bg-transparent"
        >
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-0 h-full rounded-2xl mix-blend-soft-light z-0"
            style={{ width: "38%", backgroundImage: `radial-gradient(closest-side, rgba(255,255,255,0.12), rgba(255,255,255,0.06), transparent 65%)` }}
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            transition={{ duration: sweepDurationMs / 1000, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-0 h-full rounded-2xl z-0"
            style={{ width: "30%", backgroundImage: `linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.22) 48%, transparent 76%)` }}
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            transition={{ duration: sweepDurationMs / 1000, repeat: Infinity, ease: "easeInOut" }}
          />

          <div ref={trackRef} className="relative z-10 flex w-max gap-8 sm:gap-12">
            {[...chains, ...chains, ...chains].map((c, idx) => (
              <div
                key={`${c.name}-${idx}`}
                className={`flex flex-col items-center gap-2 flex-shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ${activeUntil.current.get(idx) && activeUntil.current.get(idx)! > Date.now() ? "!grayscale-0 !opacity-100" : ""}`}
              >
                <div
                  className={`relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/20 ${c.highlight ? "ring-1 ring-[rgba(0,242,139,0.25)]" : ""}`}
                  aria-hidden="true"
                  style={chainFillActive === idx ? { outline: "2px solid rgba(0,242,139,0.35)", outlineOffset: "-2px" } : undefined}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "none" }}
                    animate={{ opacity: [0.08, 0.12, 0.08] }}
                    transition={{ duration: pulseDurationMs / 1000, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="h-6 w-6 sm:h-8 sm:w-8">{c.svg}</div>
                </div
                >
                <span className="text-[12px] sm:text-[13px] font-[600] whitespace-nowrap" style={{
                  color: activeUntil.current.get(idx) && activeUntil.current.get(idx)! > Date.now() ? "#ffffff" : "var(--muted-foreground)",
                  textShadow: "none"
                }}>{c.name}</span>
              </div>
            ))}
          </div>
          <style jsx>{`
            .chains-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            .chains-scroll::-webkit-scrollbar { display: none; }
          `}</style>
        </div>
      </motion.div>
    </motion.section>
  )
}
