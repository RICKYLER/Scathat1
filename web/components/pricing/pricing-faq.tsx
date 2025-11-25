"use client"

/**
 * Pricing FAQ Component
 * Common questions about billing, plans, and features
 */

import { ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.",
  },
  {
    question: "What happens after my free trial ends?",
    answer:
      "Your plan will automatically convert to the selected tier. We'll send you a reminder before the trial ends, and you can cancel anytime before conversion.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer:
      "Yes! Sign up for annual billing and save 20% compared to monthly pricing. Contact our sales team for enterprise discounts.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "We offer a 30-day money-back guarantee for all paid plans if you're not satisfied. Contact support@scathat.io for details.",
  },
  {
    question: "How does API access work on Pro plan?",
    answer:
      "Pro plan includes 100 API calls per day. Enterprise plans have unlimited API access. Detailed API documentation is available in your dashboard.",
  },
  {
    question: "Can I use Scathat on multiple devices?",
    answer:
      "Yes! Your subscription works across all your devices. Simply log in with your account on any device to access your scans and watchlist.",
  },
]

export function PricingFAQ() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section className="py-20 px-4 bg-(--background)">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-(--border) rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-(--surface-light) transition-colors"
              >
                <span className="font-semibold text-left">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-(--primary) flex-shrink-0 transition-transform ${openIdx === idx ? "rotate-180" : ""}`}
                />
              </button>

              {openIdx === idx && (
                <div className="px-6 py-4 bg-(--surface) border-t border-(--border)">
                  <p className="text-(--muted)">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
