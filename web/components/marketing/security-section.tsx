"use client"

/**
 * Security Section Component
 * Showcases security features and threat detection capabilities
 */

import { AlertTriangle, Shield, Zap, BarChart3 } from "lucide-react"

const threats = [
  {
    title: "Honeypots",
    description: "Detects contracts designed to trap investors",
    icon: AlertTriangle,
  },
  {
    title: "Rug Pulls",
    description: "Identifies withdrawal functions that can drain liquidity",
    icon: Shield,
  },
  {
    title: "Scam Patterns",
    description: "AI-powered detection of known scam signatures",
    icon: Zap,
  },
  {
    title: "Risk Metrics",
    description: "Comprehensive analysis with detailed scoring",
    icon: BarChart3,
  },
]

export function SecuritySection() {
  return (
    <section className="py-20 px-4 bg-(--surface)">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Description */}
          <div>
            <h2 className="text-4xl font-bold mb-6">Comprehensive Threat Detection</h2>
            <p className="text-lg text-(--muted) mb-8">
              Our AI-powered engine analyzes smart contracts across multiple dimensions to catch everything from
              sophisticated rug pulls to honeypot traps. Get real-time protection with zero false positives.
            </p>

            <div className="space-y-4">
              {threats.map((threat, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-(--primary)/20 text-(--primary)">
                      <threat.icon size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{threat.title}</h3>
                    <p className="text-(--muted) text-sm">{threat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="bg-(--card) border border-(--border) rounded-xl p-8">
            <div className="space-y-6">
              {/* Risk indicators */}
              {[
                { label: "Code Quality", value: 92, color: "text-green-400" },
                { label: "Owner Privileges", value: 78, color: "text-yellow-400" },
                { label: "Liquidity Locks", value: 85, color: "text-green-400" },
                { label: "Transfer Functions", value: 65, color: "text-yellow-400" },
              ].map((indicator, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{indicator.label}</span>
                    <span className={`text-sm font-semibold ${indicator.color}`}>{indicator.value}%</span>
                  </div>
                  <div className="h-2 bg-(--surface) rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-(--primary) to-(--accent) rounded-full"
                      style={{ width: `${indicator.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
