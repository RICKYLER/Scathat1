"use client"

import { ArrowRight } from "lucide-react"

export function HeroScanner() {
  return (
    <section className="relative min-h-[90vh] pt-24 pb-16">
      <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-[url('/grass-hero.png')] bg-cover bg-left opacity-80"></div>

      <div className="relative container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Scathat Extension
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Oneclick Smart Contract Security
              </span>
            </h1>
            <p className="text-xl text-[color:--color-text-secondary] mb-8 max-w-xl">
              Get instant risk warnings on explorer pages before you sign approvals or transactions.
            </p>
            <div className="flex gap-4">
              <a href="#pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white">
                Download Scathat
                <ArrowRight size={20} />
              </a>
              <a href="#how-it-works" className="inline-flex items-center px-6 py-3 rounded-lg border border-[color:--color-border] text-white hover:border-cyan-600/60">
                Learn
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-emerald-500/10 blur-3xl rounded-full" />
            <img
              src="/user-hero.png"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/grass-hero.png" }}
              alt="Your picture"
              className="relative z-10 w-full max-w-md mx-auto rounded-xl border border-[color:--color-border] shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
