import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative w-full px-4 py-20 sm:py-32 lg:py-40">
      {/* Left-facing mirrored grass texture with soft fade */}
      <div
        className="absolute inset-y-0 left-0 right-0 pointer-events-none opacity-70"
        style={{
          backgroundImage: "url('/textures/grass-hero-left.png')",
          backgroundSize: "cover",
          backgroundPosition: "left center",
          WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)",
          maskImage: "linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)",
        }}
      />

      {/* Soft bokeh circles for hero ambiance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-emerald-500/12 rounded-full blur-3xl" />
        <div className="absolute top-56 left-48 w-64 h-64 bg-green-400/12 rounded-full blur-3xl" />
        <div className="absolute top-96 left-10 w-72 h-72 bg-lime-400/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl space-y-8 text-center relative z-10">
        <div className="space-y-4">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Who will protect you...
            <span className="block text-accent">when no one sees?</span>
          </h1>
          <p className="text-balance text-lg text-muted-foreground sm:text-xl">
            Millions lost yearly to hacks, rugpulls, and malicious approvals. Scathat protects you with AI-powered
            real-time smart contract analysis.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row justify-center sm:gap-4">
          <Link href="#download">
            <Button size="lg" className="px-8">
              Download Extension
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="px-8 bg-transparent">
            View Demo
          </Button>
        </div>

        <div className="pt-8 grid grid-cols-3 gap-4 sm:gap-8">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent sm:text-3xl">Instant</div>
            <div className="text-xs text-muted-foreground sm:text-sm">Real-time analysis</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent sm:text-3xl">AI-Powered</div>
            <div className="text-xs text-muted-foreground sm:text-sm">Venice.ai technology</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent sm:text-3xl">Free</div>
            <div className="text-xs text-muted-foreground sm:text-sm">Always protected</div>
          </div>
        </div>
      </div>
    </section>
  )
}
