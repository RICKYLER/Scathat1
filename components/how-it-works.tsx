export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Submit Contract",
      description: "User submits contract address via web app or extension",
    },
    {
      number: "2",
      title: "Fetch Data",
      description: "Backend fetches bytecode and source from Basescan",
    },
    {
      number: "3",
      title: "AI Analysis",
      description: "Python AI engine sends contract to Venice.ai for risk scoring",
    },
    {
      number: "4",
      title: "On-Chain",
      description: "Backend writes risk score to Base via smart contract",
    },
    {
      number: "5",
      title: "Results",
      description: "Dashboard shows Safe/Warning/Dangerous results",
    },
    {
      number: "6",
      title: "Protection",
      description: "AgentKit auto-pauses or blocks risky interactions",
    },
  ]

  return (
    <section id="how" className="w-full px-4 py-20 sm:py-32 lg:py-40 border-t border-border bg-card/50">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground">How It Works</h2>
          <p className="text-lg text-muted-foreground">The complete flow from contract submission to protection</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-background p-6 space-y-3 hover:border-accent/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                {step.number}
              </div>
              <h3 className="font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
