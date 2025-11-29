"use client"

import { useEffect, useState } from "react"
import { ArrowRight, AlertCircle, CheckCircle2, Zap } from "lucide-react"
import { OrbShieldCanvas } from "@/components/three/OrbShieldCanvas"
import Lottie from "lottie-react"

export function HeroScanner() {
  const [contractAddress, setContractAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scannerAnim, setScannerAnim] = useState<any>(null)
  const [beamAnim, setBeamAnim] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    fetch("/lottie/scanner.json")
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setScannerAnim(data)
      })
      .catch(() => {})
    fetch("/lottie/scanning_beam.json")
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setBeamAnim(data)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const handleScan = async () => {
    if (!contractAddress) return

    setIsScanning(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock result based on address
    const mockResults = [
      {
        status: "SAFE",
        score: 95,
        color: "green",
        message: "No significant risks detected",
      },
      {
        status: "WARNING",
        score: 62,
        color: "yellow",
        message: "Some potential issues found",
      },
      {
        status: "DANGEROUS",
        score: 15,
        color: "red",
        message: "Critical vulnerabilities detected",
      },
    ]

    const result = mockResults[Math.floor(Math.random() * mockResults.length)]
    setScanResult(result)
    setIsScanning(false)
  }

  return (
    <section className="relative min-h-[90vh] bg-transparent pt-20 pb-12 px-4">
      {/* Background decoration - subtle animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto max-w-4xl">
        {/* Main heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white leading-tight">
            Smart Contract
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Security Simplified
            </span>
          </h1>
          <p className="text-xl text-[color:--color-text-secondary] max-w-2xl mx-auto drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
            Scan any smart contract address and get instant risk assessment powered by AI. Protect your investments with
            one click.
          </p>
        </div>

        <div className="bg-[color:--color-surface]/80 border border-[color:--color-border] rounded-2xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {beamAnim && (
            <div className="absolute inset-y-0 left-8 opacity-70 pointer-events-none">
              <Lottie animationData={beamAnim} loop style={{ height: 200, width: 600 }} />
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg overflow-hidden border border-[color:--color-border]">
              <OrbShieldCanvas useModels={false} height={240} />
            </div>
            <div className="rounded-lg overflow-hidden border border-[color:--color-border] bg-[color:--color-surface-light] flex items-center justify-center">
              {scannerAnim ? (
                <Lottie animationData={scannerAnim} loop style={{ height: 240 }} />
              ) : (
                <div className="text-[color:--color-text-secondary] text-sm">Loading animation...</div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {/* Input field */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Paste contract address (0x...)"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleScan()}
                className="input-field flex-1"
              />
              <button
                onClick={handleScan}
                disabled={!contractAddress || isScanning}
                className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-fit"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin">
                      <Zap size={20} />
                    </div>
                    Scanning...
                  </>
                ) : (
                  <>
                    Scan Now
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>

            {/* Quick info */}
            <p className="text-sm text-[color:--color-text-secondary]">
              Supports Ethereum, Polygon, Base, Arbitrum, Optimism and 50+ networks
            </p>
          </div>

          {/* Results section */}
          {scanResult && (
            <div className="mt-8 pt-8 border-t border-[color:--color-border]">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Risk status */}
                <div className="col-span-1">
                  <p className="text-sm text-[color:--color-text-secondary] mb-3">Risk Status</p>
                  <div
                    className={`flex items-center gap-3 text-2xl font-bold ${
                      scanResult.color === "green"
                        ? "text-green-400"
                        : scanResult.color === "yellow"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {scanResult.color === "green" ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                    {scanResult.status}
                  </div>
                </div>

                {/* Risk score */}
                <div className="col-span-1">
                  <p className="text-sm text-[color:--color-text-secondary] mb-3">Security Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[color:--color-primary]">{scanResult.score}</span>
                    <span className="text-[color:--color-text-secondary]">/100</span>
                  </div>
                </div>

                {/* Message */}
                <div className="col-span-1">
                  <p className="text-sm text-[color:--color-text-secondary] mb-3">Assessment</p>
                  <p className="text-lg font-medium">{scanResult.message}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button className="btn-primary">View Full Report</button>
                <button className="btn-secondary">Add to Watchlist</button>
              </div>
            </div>
          )}
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { label: "Contracts Scanned", value: "2.3M+" },
            { label: "Threats Detected", value: "847K+" },
            { label: "Active Users", value: "185K+" },
            { label: "Networks", value: "50+" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-[color:--color-surface]/50 border border-[color:--color-border] rounded-lg p-4 text-center backdrop-blur-sm hover:border-[color:--color-primary]/50 transition-colors"
            >
              <p className="text-2xl font-bold text-[color:--color-primary]">{stat.value}</p>
              <p className="text-sm text-[color:--color-text-secondary] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
