"use client"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Problem } from "@/components/problem"
import { Solution } from "@/components/solution"
import { HowItWorks } from "@/components/how-it-works"
import { Download } from "@/components/download"
import { Dashboard } from "@/components/dashboard"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="w-full overflow-hidden bg-background">
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Download />
      <Dashboard />
      <Footer />
    </main>
  )
}
