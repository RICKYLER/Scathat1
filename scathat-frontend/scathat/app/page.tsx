"use client"
import {
  Header,
  HeroSection,
  ThreatsSection,
  SolutionSection,
  HowItWorksSection,
  TargetMarketSection,
  PricingSection,
  DifferentiatorsSection,
  VisionSection,
  CTASection,
  Footer,
} from '@/components/sections'
import { ToastToaster, Toaster as Sonner, TooltipProvider } from '@/components/ui'


export default function Page() {
  return (
    <TooltipProvider>
      <ToastToaster />
      <Sonner />
      <main className="min-h-screen">
        <Header />
        <HeroSection />
        <ThreatsSection />
        <SolutionSection />
        <HowItWorksSection />
        <TargetMarketSection />
        <PricingSection />
        <DifferentiatorsSection />
        <VisionSection />
        <CTASection />
        <Footer />
      </main>
    </TooltipProvider>
  )
}
