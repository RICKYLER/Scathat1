export function Solution() {
  return (
    <section id="solution" className="w-full px-4 py-20 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground">The Solution</h2>
          <p className="text-lg text-muted-foreground">
            AI that analyzes smart contracts in real time and protects you before you sign
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card/50 p-8 space-y-4">
            <h3 className="text-xl font-bold text-accent">What Scathat does:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                <span className="text-foreground">Scans contracts instantly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                <span className="text-foreground">Detects risky patterns, rugpull logic, and hidden exploits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                <span className="text-foreground">Shows a simple Safe/Warning/Dangerous risk score</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                <span className="text-foreground">Uses AgentKit to block unsafe transactions and limit approvals</span>
              </li>
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <div className="text-sm text-muted-foreground">Target Users</div>
              <div className="font-bold text-foreground">Everyday Users</div>
              <p className="text-sm text-muted-foreground">Protection from scams and phishing</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <div className="text-sm text-muted-foreground">Target Users</div>
              <div className="font-bold text-foreground">Developers</div>
              <p className="text-sm text-muted-foreground">Fast AI security checks</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
              <div className="text-sm text-muted-foreground">Target Users</div>
              <div className="font-bold text-foreground">Wallets & dApps</div>
              <p className="text-sm text-muted-foreground">Plug-and-play safety layer</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
