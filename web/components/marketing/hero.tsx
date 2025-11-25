"use client"

/**
 * Hero Section Component
 *
 * Displays the main headline, value proposition, and primary call-to-action buttons.
 * Features animated entrance effects and social proof metrics (50K+ contracts scanned, etc).
 *
 * Key features:
 * - Animated background gradients
 * - Staggered entrance animations for elements
 * - Responsive layout for mobile/tablet/desktop
 * - Trust indicators showing impact metrics
 */

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"
import { useEffect, useState } from "react"

export function Hero() {
  // Track when component mounts to trigger entrance animations
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="min-h-screen bg-gradient-to-b from-background via-cyan-950/5 to-background/50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements - creates visual depth */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Main content container */}
      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        {/* Badge - AI-Powered Smart Contract Security */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 bg-cyan-950/50 rounded-full border border-cyan-800/50 transition-all duration-700 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <Shield size={16} className="text-cyan-400" />
          <span className="text-sm text-cyan-400">AI-Powered Smart Contract Security</span>
        </div>

        {/* Main headline with gradient text */}
        <h1
          className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Scan Smart Contracts
          </span>{" "}
          Like Never Before
        </h1>

        {/* Subheading - main value proposition */}
        <p
          className={`text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Protect your investments with AI-powered analysis. Instantly detect vulnerabilities, malicious code, and
          potential risks before you interact with any contract.
        </p>

        {/* Primary and secondary CTA buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center pt-4 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Button
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-600/50 transition-all duration-300"
          >
            Try Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="hover:bg-cyan-950/50 transition-all duration-300 bg-transparent"
          >
            Download Extension
          </Button>
        </div>

        {/* Social proof metrics - builds credibility */}
        <div
          className={`pt-8 grid grid-cols-3 gap-4 text-sm transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="p-4 bg-cyan-950/20 rounded-lg border border-cyan-800/30 hover:border-cyan-600/50 transition-all duration-300">
            <div className="text-2xl font-bold text-cyan-400">50K+</div>
            <div className="text-muted-foreground">Contracts Scanned</div>
          </div>
          <div className="p-4 bg-cyan-950/20 rounded-lg border border-cyan-800/30 hover:border-cyan-600/50 transition-all duration-300">
            <div className="text-2xl font-bold text-cyan-400">10M+</div>
            <div className="text-muted-foreground">Risks Prevented</div>
          </div>
          <div className="p-4 bg-cyan-950/20 rounded-lg border border-cyan-800/30 hover:border-cyan-600/50 transition-all duration-300">
            <div className="text-2xl font-bold text-cyan-400">99.9%</div>
            <div className="text-muted-foreground">Accuracy Rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}
