"use client"

/**
 * Home Page - ScamSniffer Inspired Security Scanner
 * Main landing page with hero scanner, features, and call-to-action
 */

import { Header } from "@/components/marketing/header"
import { HeroScanner } from "@/components/marketing/hero-scanner"
import { StatsDashboard } from "@/components/marketing/stats-dashboard"
import { SupportedNetworks } from "@/components/marketing/supported-networks"
import { Features } from "@/components/marketing/features"
import { SecuritySection } from "@/components/marketing/security-section"
import { Footer } from "@/components/marketing/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-metal site-bg-fixed text-(--foreground)">
      <Header />
      <HeroScanner />
      <StatsDashboard />
      <SupportedNetworks />
      <SecuritySection />
      <Features />
      <Footer />
    </main>
  )
}
