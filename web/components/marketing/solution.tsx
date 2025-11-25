import { CheckCircle } from "lucide-react"

export function Solution() {
  const solutions = [
    "Real-time AI analysis of contract code",
    "Instant vulnerability detection",
    "Clear risk scoring and recommendations",
    "Browser extension for one-click scanning",
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Our Solution</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">Smart & Fast</h3>
            <ul className="space-y-4">
              {solutions.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-cyan-950/30 border border-cyan-800/30 rounded-lg p-8 flex items-center justify-center">
            <div className="text-center">
              <Shield className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Protected by AI</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Shield } from "lucide-react"
