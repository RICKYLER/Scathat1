"use client"

/**
 * Supported Networks Component
 *
 * Displays all blockchain networks that Scathat supports.
 * Shows integration with major chains and growing ecosystem.
 */

export function SupportedNetworks() {
  const networks = [
    { name: "Ethereum", icon: "⟡" },
    { name: "Polygon", icon: "◈" },
    { name: "Arbitrum", icon: "→" },
    { name: "Optimism", icon: "◎" },
    { name: "Base", icon: "◆" },
    { name: "Solana", icon: "◇" },
    { name: "Avalanche", icon: "▲" },
    { name: "BSC", icon: "●" },
  ]

  return (
    <section className="py-20 px-4 bg-[color:--color-surface]/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Supported Networks</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {networks.map((network, idx) => (
            <div
              key={idx}
              className="bg-[color:--color-surface] border border-[color:--color-border] rounded-lg p-4 text-center hover:border-[color:--color-primary]/50 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-2">{network.icon}</div>
              <p className="font-semibold text-sm">{network.name}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[color:--color-text-secondary] mt-8">
          + 40 more networks supported • Always expanding
        </p>
      </div>
    </section>
  )
}
