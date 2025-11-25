"use client"

/**
 * Pricing Comparison Table
 * Detailed feature comparison across all subscription tiers
 */

const comparisonFeatures = [
  { category: "Scanning", features: ["Daily scan limit", "Concurrent scans", "AI analysis depth"] },
  { category: "Support", features: ["Email support", "Priority support", "Dedicated support"] },
  { category: "Network", features: ["Supported chains", "Custom networks", "Webhook support"] },
  { category: "Data", features: ["History retention", "Export reports", "API access"] },
]

export function PricingComparison() {
  return (
    <section className="py-20 px-4 bg-(--surface)">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12">Detailed Comparison</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-(--border)">
                <th className="text-left py-4 px-6 font-semibold">Feature</th>
                <th className="text-center py-4 px-6 font-semibold">Free</th>
                <th className="text-center py-4 px-6 font-semibold">Pro</th>
                <th className="text-center py-4 px-6 font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((group) =>
                group.features.map((feature, idx) => (
                  <tr key={`${group.category}-${idx}`} className="border-b border-(--border)">
                    <td className="py-4 px-6">{feature}</td>
                    <td className="text-center py-4 px-6">
                      {idx === 0 && "5/day"}
                      {idx === 1 && "1"}
                      {idx === 2 && "Basic"}
                      {group.category === "Support" && idx === 0 && "✓"}
                      {group.category === "Network" && idx === 0 && "5"}
                      {group.category === "Data" && idx === 0 && "7 days"}
                    </td>
                    <td className="text-center py-4 px-6 text-(--primary) font-semibold">
                      {idx === 0 && "Unlimited"}
                      {idx === 1 && "Unlimited"}
                      {idx === 2 && "Advanced"}
                      {group.category === "Support" && idx === 0 && "✓"}
                      {group.category === "Support" && idx === 1 && "✓"}
                      {group.category === "Network" && idx === 0 && "50+"}
                      {group.category === "Network" && idx === 1 && "✓"}
                      {group.category === "Data" && idx === 0 && "90 days"}
                      {group.category === "Data" && idx === 2 && "100/day"}
                    </td>
                    <td className="text-center py-4 px-6 text-(--accent) font-semibold">✓</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
