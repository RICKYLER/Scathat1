"use client"

/**
 * Features Component
 *
 * Highlights key features of the Scathat platform.
 */

import { Shield, Zap, Lock, TrendingUp } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Shield,
      title: "Real-Time Scanning",
      description: "Get instant security analysis for any smart contract address",
    },
    {
      icon: Zap,
      title: "AI-Powered Detection",
      description: "Advanced machine learning identifies threats and vulnerabilities",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-level encryption and on-chain verification of results",
    },
    {
      icon: TrendingUp,
      title: "Historical Tracking",
      description: "Monitor contract behavior changes and threat evolution over time",
    },
  ]

  return (
    <section className="py-20 px-4 bg-[color:--color-background]">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">Powerful Features</h2>
        <p className="text-center text-[color:--color-text-secondary] mb-16 max-w-2xl mx-auto">
          Everything you need to stay safe in Web3
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="bg-[color:--color-surface] border border-[color:--color-border] rounded-xl p-8 hover:border-[color:--color-primary]/50 transition-all hover:shadow-lg"
              >
                <div className="bg-gradient-to-br from-[color:--color-primary] to-[color:--color-primary]/70 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={24} className="text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-[color:--color-text-secondary]">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
