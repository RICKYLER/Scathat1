"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { heroStagger, viewportConfig, heroItem } from "@/lib/animations/variants"
import { OrbShieldCanvas } from "@/components/three/OrbShieldCanvas"

export function Hero() {
  return (
    <section className="relative w-full px-4 py-20 sm:py-32 lg:py-40">
      <motion.div 
        className="mx-auto max-w-4xl space-y-8 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={heroStagger}
      >
        <motion.div className="space-y-4" variants={heroStagger}>
          <motion.h1 
            className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground"
            variants={heroItem}
          >
            Who will protect you...
            <motion.span 
              className="block text-accent"
              variants={heroItem}
              transition={{ delay: 0.15 }}
            >
              when no one sees?
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-balance text-lg text-muted-foreground sm:text-xl"
            variants={heroItem}
            transition={{ delay: 0.3 }}
          >
            Millions lost yearly to hacks, rugpulls, and malicious approvals. Scathat protects you with AI-powered
            real-time smart contract analysis.
          </motion.p>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <OrbShieldCanvas useModels={false} height={280} />
          </div>
      </motion.div>

      

        <motion.div 
          className="flex flex-col gap-4 sm:flex-row justify-center sm:gap-4"
          variants={heroStagger}
          transition={{ delay: 0.45 }}
        >
          <Button asChild size="lg" className="px-8">
            <Link href="#download"><span className="will-change-transform">Download Extension</span></Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8 bg-transparent">
            <span className="will-change-transform">View Demo</span>
          </Button>
        </motion.div>

        <motion.div 
          className="pt-8 grid grid-cols-3 gap-4 sm:gap-8"
          variants={heroStagger}
          transition={{ delay: 0.6 }}
        >
          <motion.div 
            className="space-y-1"
            variants={heroItem}
            transition={{ delay: 0.6 }}
          >
            <div className="text-2xl font-bold text-accent sm:text-3xl">Instant</div>
            <div className="text-xs text-muted-foreground sm:text-sm">Real-time analysis</div>
          </motion.div>
          <motion.div 
            className="space-y-1"
            variants={heroItem}
            transition={{ delay: 0.65 }}
          >
            <div className="text-2xl font-bold text-accent sm:text-3xl">AI-Powered</div>
            <div className="text-xs text-muted-foreground sm:text-sm">Base AgentKit & Venice.ai</div>
          </motion.div>
          <motion.div 
            className="space-y-1"
            variants={heroItem}
            transition={{ delay: 0.7 }}
          >
            <div className="text-2xl font-bold text-accent sm:text-3xl">Free</div>
            <div className="text-xs text-muted-foreground sm:text-sm">Always protected</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
