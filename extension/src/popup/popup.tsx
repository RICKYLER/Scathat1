"use client"

/**
 * Browser Extension Popup Component
 * Main interface for the Scathat Chrome extension
 * Minimal, focused UI for quick contract scanning
 */

import { useState } from "react"
import { AlertCircle, CheckCircle2, Copy, Zap } from "lucide-react"
import "./popup.css"

export function Popup() {
  const [contractAddress, setContractAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  const handleScan = async () => {
    if (!contractAddress) return

    setIsScanning(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockResults = [
      { status: "SAFE", score: 95, color: "green" },
      { status: "WARNING", score: 62, color: "yellow" },
      { status: "DANGEROUS", score: 15, color: "red" },
    ]

    setScanResult(mockResults[Math.floor(Math.random() * mockResults.length)])
    setIsScanning(false)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress)
  }

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="popup-header">
        <h1>Scathat</h1>
        <p>Smart Contract Security</p>
      </div>

      {/* Scanner */}
      <div className="popup-scanner">
        <div className="input-group">
          <input
            type="text"
            placeholder="Paste contract (0x...)"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
            className="popup-input"
          />
          {contractAddress && (
            <button onClick={copyAddress} className="copy-btn">
              <Copy size={16} />
            </button>
          )}
        </div>

        <button onClick={handleScan} disabled={!contractAddress || isScanning} className="scan-btn">
          {isScanning ? (
            <>
              <Zap size={16} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Zap size={16} />
              Scan Now
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {scanResult && (
        <div className={`popup-result result-${scanResult.color}`}>
          <div className="result-header">
            {scanResult.color === "green" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span className="result-status">{scanResult.status}</span>
          </div>
          <div className="result-score">
            <span className="score-value">{scanResult.score}</span>
            <span className="score-max">/100</span>
          </div>
          <a href="#" className="result-link">
            View Full Report →
          </a>
        </div>
      )}

      {/* Footer */}
      <div className="popup-footer">
        <a href="#">Dashboard</a>
        <a href="#">Help</a>
      </div>
    </div>
  )
}
