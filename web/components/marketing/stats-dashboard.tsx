"use client"

/**
 * Stats Dashboard Component
 *
 * Displays key platform metrics and achievements.
 * Shows the scale and impact of Scathat's security scanning.
 */

export function StatsDashboard() {
  const stats = [
    {
      number: "26M+",
      label: "Tokens Scanned",
      description: "Comprehensive analysis across all token types",
    },
    {
      number: "28M+",
      label: "Total Users",
      description: "Growing community of Web3 security enthusiasts",
    },
    {
      number: "497M+",
      label: "Assets Protected (USD)",
      description: "Value secured through our platform",
    },
    {
      number: "88+",
      label: "Supported Chains",
      description: "Coverage across all major blockchain networks",
    },
  ]

  return (
    <section className="py-20 px-4 bg-[color:--color-background] border-t border-[color:--color-border]">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
          Industry-Leading Security Platform
        </h2>
        <p className="text-center text-[color:--color-text-secondary] mb-16 max-w-2xl mx-auto">
          Trusted by millions of users to protect their smart contract interactions
        </p>

        {/* Stats grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-[color:--color-surface] to-[color:--color-surface]/50 border border-[color:--color-border] rounded-xl p-6 hover:border-[color:--color-primary]/50 transition-all hover:shadow-lg"
            >
              <p className="text-4xl font-bold text-[color:--color-primary] mb-2">{stat.number}</p>
              <p className="text-lg font-semibold text-white mb-1">{stat.label}</p>
              <p className="text-sm text-[color:--color-text-secondary]">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
