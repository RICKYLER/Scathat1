"use client"

import { useState } from "react"
import { CheckCircle2, AlertTriangle, AlertCircle, Loader2, Zap, Check, X } from "lucide-react"

type ScanStatus = "idle" | "scanning" | "safe" | "warning" | "dangerous"
type ScanStage = "decompile" | "analysis" | "audit" | "scoring" | "complete"

type Severity = "safe" | "warning" | "dangerous"

type Issue = {
  text: string
  severity: Severity
  category: string
  description: string
  impact: string
  likelihood: string
}

interface ScanResult {
  status: Severity
  riskScore: number
  issues: Issue[]
  recommendation: string
  contractName?: string
  scanTime: number
  linesAnalyzed: number
}

export default function ScannerInterface() {
  const [contractAddress, setContractAddress] = useState("")
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle")
  const [scanStage, setScanStage] = useState<ScanStage>("decompile")
  const [result, setResult] = useState<ScanResult | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loadedIssuesCount, setLoadedIssuesCount] = useState(0)
  const [scanProgress, setScanProgress] = useState(0)

  const vulnerabilitiesDb: Record<string, Issue> = {
    reentrancy: {
      text: "Reentrancy vulnerability detected in transfer functions",
      severity: "dangerous",
      category: "Logic Flaw",
      description: "External call made before state update allows attacker to call function recursively",
      impact: "Critical - Funds can be stolen",
      likelihood: "High - Easy to exploit",
    },
    integerOverflow: {
      text: "Integer overflow/underflow risk in arithmetic operations",
      severity: "dangerous",
      category: "Arithmetic",
      description: "No safe math library used; arithmetic operations can overflow/underflow",
      impact: "Critical - Token balance manipulation",
      likelihood: "High - Common attack vector",
    },
    accessControl: {
      text: "Insufficient access control on admin functions",
      severity: "dangerous",
      category: "Authorization",
      description: "Admin functions lack proper permission checks (missing onlyOwner modifiers)",
      impact: "Critical - Unauthorized access to contract functions",
      likelihood: "High - Trivial to exploit",
    },
    honeypot: {
      text: "Suspicious honeypot pattern detected (buy/sell mismatch)",
      severity: "dangerous",
      category: "Honeypot",
      description: "Buy transactions allowed but sell transactions blocked or heavily restricted",
      impact: "Critical - Investors cannot exit position",
      likelihood: "High - Intentional scam mechanism",
    },
    hiddenFees: {
      text: "Hidden fee mechanism detected in transfer logic",
      severity: "dangerous",
      category: "Financial",
      description: "Transfer function secretly deducts additional fees not disclosed to users",
      impact: "Critical - Silent fund theft",
      likelihood: "High - Systematic extraction",
    },
    ownerDrain: {
      text: "Owner can drain contract liquidity or pause transfers",
      severity: "dangerous",
      category: "Control",
      description: "Owner has functions to withdraw all funds or freeze trading",
      impact: "Critical - Total fund loss possible",
      likelihood: "High - Owner-controlled rug pull",
    },
    uncheckedCall: {
      text: "Unchecked low-level calls that could fail silently",
      severity: "dangerous",
      category: "External Call",
      description: "call() or delegatecall() used without checking return value",
      impact: "Critical - Failed transactions silently succeed",
      likelihood: "Medium - Requires specific conditions",
    },
    delegatecall: {
      text: "Unsafe delegatecall usage detected in proxy pattern",
      severity: "dangerous",
      category: "Delegation",
      description: "delegatecall to untrusted contract or with insufficient validation",
      impact: "Critical - Arbitrary code execution",
      likelihood: "High - State can be corrupted",
    },
    frontRunning: {
      text: "Front-running vulnerability in transaction ordering",
      severity: "dangerous",
      category: "MEV",
      description: "Transaction order dependent on public mempool - vulnerable to frontrunning",
      impact: "High - Slippage and profit theft",
      likelihood: "High - Automated attacks",
    },
    centralization: {
      text: "Centralized authority with excessive permissions",
      severity: "warning",
      category: "Centralization",
      description: "Single owner/multisig with unchecked power over contract parameters",
      impact: "High - Owner can modify contract behavior",
      likelihood: "Medium - Depends on owner intent",
    },
    unverified: {
      text: "Source code not verified on blockchain explorer",
      severity: "warning",
      category: "Verification",
      description: "Cannot verify source code matches deployed bytecode",
      impact: "Medium - Cannot audit code logic",
      likelihood: "Medium - Common practice",
    },
    newDeployment: {
      text: "Contract deployed recently (potential scam indicator)",
      severity: "warning",
      category: "Deployment",
      description: "Contract age less than 7 days - increased rug pull risk",
      impact: "Medium - Limited track record",
      likelihood: "Medium - Many scams are new",
    },
    lowLiquidity: {
      text: "Liquidity pool shows signs of low/locked liquidity",
      severity: "warning",
      category: "Liquidity",
      description: "LP tokens burned, liquidity below market average, or provider has keys",
      impact: "Medium - High slippage, price manipulation possible",
      likelihood: "High - Check LP on Etherscan",
    },
    mintable: {
      text: "Token supply can be increased after launch",
      severity: "warning",
      category: "Supply",
      description: "Mint function enabled - creator can inflate supply indefinitely",
      impact: "High - Token dilution and value erosion",
      likelihood: "Medium - Check token settings",
    },
    noAudit: {
      text: "Contract has not been audited by security firm",
      severity: "warning",
      category: "Audit",
      description: "No professional security audit - increased risk of hidden vulnerabilities",
      impact: "Medium - Unknown risks remain",
      likelihood: "High - Most contracts unaudited",
    },
    gasMisuse: {
      text: "Inefficient gas usage patterns detected",
      severity: "warning",
      category: "Optimization",
      description: "Repeated storage reads, unnecessary loops, or suboptimal patterns",
      impact: "Low - High transaction costs",
      likelihood: "High - Common oversight",
    },
  }

  const calculateRiskScore = (issues: ScanResult["issues"]): number => {
    let score = 0
    const severityWeights = {
      dangerous: 35,
      warning: 12,
      safe: 0,
    }

    for (const issue of issues) {
      score += severityWeights[issue.severity] || 0
    }

    // Apply multiplier for multiple critical issues
    const criticalCount = issues.filter((i) => i.severity === "dangerous").length
    if (criticalCount >= 3) score = Math.min(100, score * 1.2)

    return Math.min(100, Math.round(score))
  }

  const generateMockResult = (): ScanResult => {
    const resultType: Severity = ["safe", "warning", "dangerous"][Math.floor(Math.random() * 3)] as Severity
    const linesAnalyzed = 5000 + Math.floor(Math.random() * 15000)
    const scanTime = 3.5 + Math.random() * 2.5

    let issues: ScanResult["issues"] = []

    if (resultType === "safe") {
      // Safe contract might have minor warnings
      issues = Math.random() > 0.5 ? [] : [vulnerabilitiesDb.noAudit]
    } else if (resultType === "warning") {
      // Medium risk: 2-4 warning issues
      const warningVulns = ["centralization", "unverified", "newDeployment", "noAudit", "lowLiquidity", "gasMisuse"]
      const count = 2 + Math.floor(Math.random() * 3)
      const selected = warningVulns.sort(() => Math.random() - 0.5).slice(0, count)
      issues = selected.map((key) => vulnerabilitiesDb[key])
    } else {
      // Dangerous: 2-5 critical issues + warnings
      const dangerousVulns = [
        "honeypot",
        "hiddenFees",
        "ownerDrain",
        "reentrancy",
        "integerOverflow",
        "accessControl",
        "uncheckedCall",
        "delegatecall",
      ]
      const warningVulns = ["centralization", "unverified", "newDeployment"]

      const dangerousCount = 2 + Math.floor(Math.random() * 3)
      const warningCount = Math.random() > 0.5 ? 1 + Math.floor(Math.random() * 2) : 0

      const selectedDangerous = dangerousVulns.sort(() => Math.random() - 0.5).slice(0, dangerousCount)
      const selectedWarning = warningVulns.sort(() => Math.random() - 0.5).slice(0, warningCount)

      issues = [
        ...selectedDangerous.map((key) => vulnerabilitiesDb[key]),
        ...selectedWarning.map((key) => vulnerabilitiesDb[key]),
      ]
    }

    const riskScore = calculateRiskScore(issues)

    const recommendations: Record<Severity, string> = {
      safe: "Contract has passed security checks. Safe to interact with.",
      warning: "Proceed with caution. Review identified issues before large transactions.",
      dangerous: "DO NOT INTERACT. High probability of scam, rug pull, or critical vulnerability.",
    }

    return {
      status: resultType,
      riskScore,
      issues,
      recommendation: recommendations[resultType],
      contractName: resultType === "safe" ? "Verified Token" : "Analyzed Contract",
      scanTime: Number.parseFloat(scanTime.toFixed(2)),
      linesAnalyzed,
    }
  }

  const handleScan = async () => {
    if (!contractAddress.trim()) return

    setScanStatus("scanning")
    setResult(null)
    setLoadedIssuesCount(0)
    setScanProgress(0)

    // Stage 1: Decompile (1.5s)
    setScanStage("decompile")
    for (let i = 0; i <= 25; i++) {
      await new Promise((resolve) => setTimeout(resolve, 60))
      setScanProgress(i)
    }

    // Stage 2: Analysis (2s)
    setScanStage("analysis")
    for (let i = 25; i <= 50; i++) {
      await new Promise((resolve) => setTimeout(resolve, 80))
      setScanProgress(i)
    }

    // Stage 3: Audit (1.5s)
    setScanStage("audit")
    for (let i = 50; i <= 75; i++) {
      await new Promise((resolve) => setTimeout(resolve, 60))
      setScanProgress(i)
    }

    // Stage 4: Risk Scoring (1s)
    setScanStage("scoring")
    for (let i = 75; i <= 95; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      setScanProgress(i)
    }

    // Stage 5: Complete & Show Results
    setScanStage("complete")
    setScanProgress(100)
    const mockResult = generateMockResult()
    setResult(mockResult)
    setScanStatus(mockResult.status)

    if (mockResult.issues.length > 0) {
      for (let i = 0; i < mockResult.issues.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setLoadedIssuesCount((prev) => prev + 1)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "from-emerald-500 to-teal-500"
      case "warning":
        return "from-amber-500 to-orange-500"
      case "dangerous":
        return "from-red-500 to-rose-500"
      default:
        return "from-primary to-emerald-400"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-emerald-500/10 border-emerald-500/30"
      case "warning":
        return "bg-amber-500/10 border-amber-500/30"
      case "dangerous":
        return "bg-red-500/10 border-red-500/30"
      default:
        return "bg-primary/10 border-primary/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <CheckCircle2 className="w-12 h-12 text-emerald-500" />
      case "warning":
        return <AlertTriangle className="w-12 h-12 text-amber-500" />
      case "dangerous":
        return <AlertCircle className="w-12 h-12 text-red-500" />
      default:
        return null
    }
  }

  const getIssueIcon = (severity: string) => {
    switch (severity) {
      case "safe":
        return <Check className="w-4 h-4 text-emerald-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case "dangerous":
        return <X className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getScanStageLabel = () => {
    switch (scanStage) {
      case "decompile":
        return "Decompiling bytecode..."
      case "analysis":
        return "Analyzing patterns and logic..."
      case "audit":
        return "Performing security audit..."
      case "scoring":
        return "Calculating risk metrics..."
      case "complete":
        return "Scan complete!"
      default:
        return "Analyzing smart contract…"
    }
  }

  const handleReset = () => {
    setContractAddress("")
    setScanStatus("idle")
    setResult(null)
    setScanStage("decompile")
    setScanProgress(0)
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Branding */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Scathat Scanner</h1>
          </div>
          <p className="text-muted-foreground text-sm">Real-Time AI Smart Contract Security</p>
        </div>

        {/* Main Scanner Section */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="contract" className="block text-sm font-medium text-foreground mb-3">
                  Contract Address
                </label>
                <input
                  id="contract"
                  type="text"
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  disabled={scanStatus === "scanning"}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Advanced Scan Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAdvanced}
                    onChange={(e) => setShowAdvanced(e.target.checked)}
                    disabled={scanStatus === "scanning"}
                    className="w-4 h-4 rounded bg-background border-border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">Advanced Scan (for developers)</span>
                </label>
              </div>

              {/* Scan Button */}
              <button
                onClick={handleScan}
                disabled={!contractAddress.trim() || scanStatus === "scanning"}
                className="w-full mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
              >
                {scanStatus === "scanning" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing smart contract…
                  </>
                ) : (
                  <>
                    Try Scan <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {scanStatus === "scanning" && (
            <div className="bg-card rounded-xl border border-border p-8">
              <div className="space-y-6">
                <div className="flex justify-center mb-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <p className="text-center text-muted-foreground text-sm">{getScanStageLabel()}</p>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">{scanProgress}% Complete</p>
                </div>

                <div className="space-y-2">
                  {["decompile", "analysis", "audit", "scoring"].map((stage, idx) => (
                    <div key={stage} className="flex items-center gap-3 text-sm">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          ["decompile", "analysis", "audit", "scoring"].indexOf(stage) <
                          ["decompile", "analysis", "audit", "scoring"].indexOf(scanStage)
                            ? "border-primary bg-primary text-primary-foreground"
                            : ["decompile", "analysis", "audit", "scoring"].indexOf(stage) ===
                                ["decompile", "analysis", "audit", "scoring"].indexOf(scanStage)
                              ? "border-primary bg-background"
                              : "border-border bg-background"
                        }`}
                      >
                        {["decompile", "analysis", "audit", "scoring"].indexOf(stage) <
                        ["decompile", "analysis", "audit", "scoring"].indexOf(scanStage) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <span className="text-xs">{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`${
                          ["decompile", "analysis", "audit", "scoring"].indexOf(stage) <=
                          ["decompile", "analysis", "audit", "scoring"].indexOf(scanStage)
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stage === "decompile" && "Decompiling bytecode"}
                        {stage === "analysis" && "Analyzing patterns"}
                        {stage === "audit" && "Security audit"}
                        {stage === "scoring" && "Risk calculation"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && scanStatus !== "scanning" && (
            <div className="space-y-4">
              {/* Verdict Card */}
              <div className={`bg-card rounded-xl border-2 p-8 ${getStatusBgColor(result.status)}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{getStatusIcon(result.status)}</div>
                  <div className="flex-1">
                    <h2
                      className={`text-2xl font-bold mb-2 bg-gradient-to-r ${getStatusColor(result.status)} bg-clip-text text-transparent`}
                    >
                      {result.status.toUpperCase()}
                    </h2>
                    {result.contractName && (
                      <p className="text-sm text-muted-foreground mb-3">Contract: {result.contractName}</p>
                    )}
                    <p className="text-foreground">{result.recommendation}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {/* Risk Score */}
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Risk Score</p>
                  <div className="flex items-end gap-1">
                    <span
                      className={`text-2xl font-bold bg-gradient-to-r ${getStatusColor(result.status)} bg-clip-text text-transparent`}
                    >
                      {result.riskScore}
                    </span>
                    <span className="text-muted-foreground text-xs mb-1">/100</span>
                  </div>
                </div>

                {/* Detected Issues Count */}
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Issues</p>
                  <p className="text-2xl font-bold text-foreground">{result.issues.length}</p>
                </div>

                {/* Scan Time */}
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Scan Time</p>
                  <p className="text-2xl font-bold text-foreground">{result.scanTime}s</p>
                </div>

                {/* Lines Analyzed */}
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Lines</p>
                  <p className="text-2xl font-bold text-foreground">{(result.linesAnalyzed / 1000).toFixed(1)}k</p>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-sm font-semibold text-foreground mb-4">Detected Issues</p>
                  <ul className="space-y-4">
                    {result.issues.map((issue, idx) => (
                      <li
                        key={idx}
                        className={`text-sm transition-all duration-500 ${
                          idx < loadedIssuesCount ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[-20px]"
                        }`}
                      >
                        <div className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                          <div className="flex-shrink-0 mt-1">{getIssueIcon(issue.severity)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{issue.text}</p>
                            <div className="mt-2 space-y-1 text-xs">
                              <p className="text-muted-foreground">
                                <span className="font-semibold">Category:</span> {issue.category}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-semibold">Impact:</span> {issue.impact}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-semibold">Likelihood:</span> {issue.likelihood}
                              </p>
                              <p className="text-muted-foreground/80 pt-1">{issue.description}</p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Scan Another
                </button>
                <button
                  disabled
                  className="flex-1 px-4 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-border/20 transition-colors disabled:opacity-50"
                >
                  View Full Report
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {scanStatus === "idle" && !result && (
            <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">Enter a contract address and click &quot;Try Scan&quot; to begin</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-muted-foreground">
          <p>Powered by Venice.ai + AgentKit</p>
        </div>
      </div>
    </div>
  )
}
