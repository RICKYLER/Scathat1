import { Chrome, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Download() {
  return (
    <section id="pricing" className="py-20 px-4 bg-background/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Get Scathat Now</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-background/50 border border-border/40 rounded-lg">
            <Chrome className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Chrome Extension</h3>
            <p className="text-muted-foreground mb-6">One-click scanning directly in your browser</p>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Install Extension</Button>
          </div>
          <div className="p-8 bg-background/50 border border-border/40 rounded-lg">
            <Globe className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Web Dashboard</h3>
            <p className="text-muted-foreground mb-6">Full dashboard with detailed analytics</p>
            <Button variant="outline" className="w-full bg-transparent">
              Access Dashboard
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
