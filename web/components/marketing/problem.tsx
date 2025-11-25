"use client"

import { AlertTriangle, Zap, Eye } from "lucide-react"
import { useState } from "react"

export function Problem() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const problems = [
    {
      icon: AlertTriangle,
      title: "Hidden Vulnerabilities",
      description: "Most users cannot spot contract vulnerabilities before losing funds",
      stats: "87% of exploits go unnoticed",
    },
    {
      icon: Zap,
      title: "Complex Code",
      description: "Smart contract code is difficult to understand for average users",
      stats: "Average user reads only 2% of code",
    },
    {
      icon: Eye,
      title: "No Transparency",
      description: "Lack of real-time security insights before interactions",
      stats: "No warning system available",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 bg-background/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">The Problem</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-6 bg-background/50 border rounded-lg transition-all duration-300 ${
                  hoveredIndex === i
                    ? "border-red-600/50 bg-red-950/10 shadow-lg shadow-red-600/10 scale-105"
                    : "border-border/40 hover:border-red-600/30"
                }`}
              >
                <Icon
                  className={`h-8 w-8 mb-4 transition-all duration-300 ${
                    hoveredIndex === i ? "text-red-400 scale-110" : "text-orange-400"
                  }`}
                />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <div
                  className={`pt-4 border-t border-border/20 transition-all duration-300 ${
                    hoveredIndex === i ? "text-red-400" : "text-muted-foreground"
                  }`}
                >
                  <p className="text-sm font-semibold">{item.stats}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
