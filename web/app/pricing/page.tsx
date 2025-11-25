"use client"

/**
 * Pricing Page - Subscription Tiers
 * Display Scathat pricing plans: Free, Pro, and Enterprise
 */

import { Header } from "@/components/marketing/header"
import { PricingPlans } from "@/components/pricing/pricing-plans"
import { PricingComparison } from "@/components/pricing/pricing-comparison"
import { PricingFAQ } from "@/components/pricing/pricing-faq"
import { Footer } from "@/components/marketing/footer"

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <Header />
      <PricingPlans />
      <PricingComparison />
      <PricingFAQ />
      <Footer />
    </main>
  )
}
