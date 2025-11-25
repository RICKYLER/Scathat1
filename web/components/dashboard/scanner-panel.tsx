"use client"

import { Button } from "@/components/ui/button"
import { Zap, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

export function ScannerPanel() {
  const [contractAddress, setContractAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  const handleScan = () => {
    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 300)
  }

  return (
    <div className="bg-background/50 border border-border/40 rounded-lg p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Scan Contract</h2>
        <p className="text-muted-foreground">Enter a contract address or paste the code to analyze</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Contract Address</label>
          <input
            type="text"
            placeholder="0x... or paste contract code"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            disabled={isScanning}
            className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 transition-all duration-300 disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground mt-1">Supports Ethereum, Polygon, BSC, and Avalanche</p>
        </div>

        {isScanning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analyzing contract...</span>
              <span className="text-cyan-400 font-medium">{Math.round(scanProgress)}%</span>
            </div>
            <div className="w-full bg-background border border-border/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <Button
          onClick={handleScan}
          disabled={isScanning || !contractAddress.trim()}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 transition-all duration-300"
        >
          {isScanning ? (
            <>
              <Zap className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Start Scan
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
          <div>
            <p className="font-medium text-sm">98% Accurate</p>
            <p className="text-xs text-muted-foreground">AI-powered detection</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <p className="font-medium text-sm">30 Seconds</p>
            <p className="text-xs text-muted-foreground">Fast analysis</p>
          </div>
        </div>
      </div>
    </div>
  )
}
