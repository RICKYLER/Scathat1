import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      text: "Saved me from a honeypot contract. Scathat is a lifesaver!",
      author: "Alex Chen",
      role: "DeFi Trader",
    },
    {
      text: "Finally a tool that makes smart contract security accessible.",
      author: "Jordan Smith",
      role: "Crypto Developer",
    },
    {
      text: "The accuracy is incredible. Highly recommend to all investors.",
      author: "Riley Park",
      role: "Portfolio Manager",
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">What Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div key={i} className="p-6 bg-background/50 border border-border/40 rounded-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-4 text-muted-foreground">"{item.text}"</p>
              <div>
                <div className="font-bold">{item.author}</div>
                <div className="text-sm text-muted-foreground">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
