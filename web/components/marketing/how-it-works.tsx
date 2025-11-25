"use client"

/**
 * How It Works Section
 *
 * Interactive 6-step walkthrough showing users how to use Scathat.
 * Features:
 * - 6 steps with icons and descriptions
 * - Click to highlight individual steps
 * - Arrow indicators showing flow (desktop only)
 * - Responsive grid layout
 * - Bottom banner highlighting key benefit (30 second analysis)
 */

import { ArrowRight, Zap } from "lucide-react"
import { useState } from "react"

export function HowItWorks() {
  // Track which step is currently selected/highlighted
  const [activeStep, setActiveStep] = useState(0)

  // Array of steps - easy to modify or add more steps
  const steps = [
    { number: "1", title: "Install Extension", desc: "Add Scathat to your browser in seconds", icon: "📦" },
    { number: "2", title: "Visit Contract", desc: "Navigate to any smart contract explorer", icon: "🔍" },
    { number: "3", title: "One Click Scan", desc: "Click the Scathat icon to start analysis", icon: "⚡" },
    { number: "4", title: "Get Results", desc: "Instant AI-powered security report", icon: "📊" },
    { number: "5", title: "View Report", desc: "Detailed vulnerability breakdown", icon: "📋" },
    { number: "6", title: "Make Decision", desc: "Interact safely with confidence", icon: "✅" },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 bg-background/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>

        {/* Step cards grid - 3 columns on desktop, 1 on mobile */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={index}
              onClick={() => setActiveStep(index)}
              className={`relative p-6 rounded-lg cursor-pointer transition-all duration-300 ${
                activeStep === index
                  ? "bg-cyan-950/50 border border-cyan-600 shadow-lg shadow-cyan-600/20"
                  : "bg-background/50 border border-border/40 hover:border-cyan-600/50"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Step number indicator - highlights when active */}
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-bold flex-shrink-0 transition-all duration-300 ${
                    activeStep === index
                      ? "bg-cyan-600 text-white scale-110"
                      : "bg-background border border-border/40 text-cyan-400"
                  }`}
                >
                  {step.number}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              </div>

              {/* Arrow between steps - desktop only */}
              {index < steps.length - 1 && (
                <ArrowRight
                  className={`h-4 w-4 absolute -right-12 top-6 hidden md:block transition-all duration-300 ${
                    activeStep >= index ? "text-cyan-600" : "text-muted-foreground"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bottom banner - key benefit highlight */}
        <div className="bg-gradient-to-r from-cyan-950/20 to-blue-950/20 rounded-lg p-8 border border-cyan-800/30">
          <div className="flex items-center justify-center gap-4">
            <Zap className="h-6 w-6 text-cyan-400 animate-pulse" />
            <p className="text-center text-muted-foreground">
              Complete analysis in <span className="text-cyan-400 font-bold">under 30 seconds</span> with AI-powered
              vulnerability detection
            </p>
            <Zap className="h-6 w-6 text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}
