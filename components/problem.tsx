export function Problem() {
  const problems = [
    "Users cannot read or understand smart contracts",
    "Builders move fast and skip security",
    "Wallets warn users too late",
    "Auditing tools are slow, expensive, and reactive",
    "People only realize they were hacked after pressing confirm",
  ]

  return (
    <section id="problem" className="w-full px-4 py-20 sm:py-32 lg:py-40 border-t border-border bg-card/50">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground">The Problem</h2>
          <p className="text-lg text-muted-foreground">
            Millions lost yearly to hacks, rugpulls, and malicious approvals
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="flex gap-4 rounded-lg border border-border/50 bg-background p-6 hover:border-border transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-destructive text-destructive-foreground font-bold">
                  {index + 1}
                </div>
              </div>
              <p className="text-muted-foreground">{problem}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
