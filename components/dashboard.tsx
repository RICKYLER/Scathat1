"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Dashboard() {
  const [contractAddress, setContractAddress] = useState("0x...")
  const [scanResult, setScanResult] = useState<"safe" | "warning" | "danger" | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "transition" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const DURATION = { loading: 500, transition: 400, verify: 400 }

  const mockScan = async () => {
    setErrorMessage(null)
    setScanResult(null)
    setStatus("loading")
    await new Promise((r) => setTimeout(r, DURATION.loading))
    setStatus("transition")
    await new Promise((r) => setTimeout(r, DURATION.transition))
    const fail = Math.random() < 0.15
    if (fail) {
      setStatus("error")
      setErrorMessage("Network error. Please try again.")
      return
    }
    const results: Array<"safe" | "warning" | "danger"> = ["safe", "warning", "danger"]
    const result = results[Math.floor(Math.random() * 3)]
    setScanResult(result)
    setStatus("success")
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "safe":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "danger":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case "safe":
        return "bg-green-500/10 border-green-500/30"
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30"
      case "danger":
        return "bg-red-500/10 border-red-500/30"
      default:
        return "bg-card border-border"
    }
  }

  return (
    <section className="w-full px-4 py-20 sm:py-32 lg:py-40 border-t border-border bg-card/50">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground">Try Scathat Now</h2>
          <p className="text-lg text-muted-foreground">Analyze any smart contract instantly</p>
        </div>

        <div className="rounded-lg border border-border bg-background p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Contract Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={mockScan} className="px-6">
                Scan
              </Button>
            </div>
          </div>

          {status === "loading" && (
            <div className="rounded-lg border border-border/50 bg-background/50 p-8 flex items-center justify-center gap-4" role="status" aria-live="polite" aria-label="Loading analysis">
              <div className="h-6 w-6 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin"></div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/80 animate-pulse"></span>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" style={{ animationDelay: "120ms" }}></span>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: "240ms" }}></span>
              </div>
            </div>
          )}

          {status === "transition" && (
            <div className="rounded-lg border border-border/50 bg-background/50 p-8" role="status" aria-live="polite" aria-label="Preparing results">
              <div className="h-1 w-full bg-border rounded overflow-hidden">
                <div className="h-1 bg-primary" style={{ transformOrigin: "left", animation: `progress var(--anim-duration, ${DURATION.transition}ms) ease-in-out forwards` }}></div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">Preparing results</div>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-lg border p-6 space-y-3 bg-red-500/10 border-red-500/30" role="alert" aria-live="assertive" aria-label="Analysis failed">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path className="shake" d="M12 2a10 10 0 100 20 10 10 0 000-20zm5 5l-10 10M7 7l10 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <div className="text-sm text-red-400">{errorMessage || "Something went wrong"}</div>
              </div>
              <div className="text-xs text-muted-foreground">Check your connection and try again.</div>
            </div>
          )}

          {scanResult && (
            <div className={`rounded-lg border p-6 space-y-4 ${getRiskBg(scanResult)}`}>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Risk Assessment</div>
                <div className="flex items-center gap-2" aria-live="polite" aria-label="Analysis completed">
                  <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ ['--anim-duration' as any]: `${DURATION.verify}ms` }}>
                    <path className="check-path" d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="text-xs text-muted-foreground">Verified</span>
                </div>
                <div className={`text-3xl font-bold ${getRiskColor(scanResult)}`}>
                  {scanResult === "safe" && "Safe"}
                  {scanResult === "warning" && "Warning"}
                  {scanResult === "danger" && "Dangerous"}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded bg-background/50 p-3">
                  <div className="text-xs text-muted-foreground mb-1">Patterns Found</div>
                  <div className="font-bold text-foreground">{Math.floor(Math.random() * 5) + 1}</div>
                </div>
                <div className="rounded bg-background/50 p-3">
                  <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                  <div className="font-bold text-foreground">
                    {scanResult === "safe" ? "2/10" : scanResult === "warning" ? "6/10" : "9/10"}
                  </div>
                </div>
                <div className="rounded bg-background/50 p-3">
                  <div className="text-xs text-muted-foreground mb-1">Analysis Time</div>
                  <div className="font-bold text-foreground">&lt;500ms</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Details</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1"></span>
                    <span>Contract verified and audit-ready</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1"></span>
                    <span>No known exploit patterns detected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1"></span>
                    <span>Approvals appear standard for this contract type</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {status === "idle" && !scanResult && (
            <div className="rounded-lg border border-dashed border-border/50 bg-background/50 p-8 text-center space-y-3">
              <svg
                className="w-12 h-12 mx-auto text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-muted-foreground">Enter a contract address and click Scan to see the analysis</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
