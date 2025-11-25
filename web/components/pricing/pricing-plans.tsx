"use client"

/**
 * Pricing Plans Component
 * Display three subscription tiers: Free, Pro, and Enterprise
 * Each plan shows features and call-to-action button
 */

import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "0",
    description: "For individuals exploring contract security",
    features: [
      "5 scans per day",
      "Basic risk assessment",
      "Community support",
      "Standard network support (5 chains)",
      "Scan history (7 days)",
      "Browser extension",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "For active traders and developers",
    features: [
      "Unlimited scans",
      "Advanced risk assessment with AI analysis",
      "Priority email support",
      "50+ network support",
      "Scan history (90 days)",
      "Watchlist (up to 100 contracts)",
      "Real-time alerts",
      "API access (100 calls/day)",
      "No watermark on reports",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and protocols",
    features: [
      "Custom scan limits",
      "Advanced AI models",
      "Dedicated support",
      "All networks + custom integration",
      "Unlimited history",
      "Team management",
      "Custom alerts & webhooks",
      "Unlimited API access",
      "White-label option",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function PricingPlans() {
  return (
    <section className="py-20 px-4 bg-(--background)">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            Simple, Transparent
            <span className="block text-(--primary)">Pricing</span>
          </h2>
          <p className="text-xl text-(--muted) max-w-2xl mx-auto">
            Choose the perfect plan for your security needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border backdrop-blur-sm transition-all ${
                plan.highlighted
                  ? "border-(--primary) bg-(--surface) shadow-2xl shadow-(--primary)/20 md:scale-105"
                  : "border-(--border) bg-(--card)"
              }`}
            >
              {/* Recommended badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-(--primary) text-(--background) px-4 py-1 rounded-full text-sm font-semibold">
                    Recommended
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan name and description */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-(--muted) text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-(--muted)">/month</span>}
                </div>

                {/* CTA button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold mb-8 transition-all ${
                    plan.highlighted
                      ? "bg-(--primary) text-(--background) hover:bg-(--primary-dark)"
                      : "border border-(--border) text-(--foreground) hover:bg-(--surface-light)"
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features list */}
                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-3">
                      <Check size={20} className="text-(--primary) flex-shrink-0 mt-0.5" />
                      <span className="text-(--foreground)">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ note */}
        <div className="text-center">
          <p className="text-(--muted)">All plans include a 7-day free trial. No credit card required.</p>
        </div>
      </div>
    </section>
  )
}
