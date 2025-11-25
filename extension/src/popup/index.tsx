"use client"

import { useState } from "react"
import "../styles/popup.css"
import { getScanResult } from "../utils/api"

export function Popup() {
  const [contractAddress, setContractAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleScan = async () => {
    if (!contractAddress.trim()) return

    setIsScanning(true)
    try {
      const scanResult = await getScanResult(contractAddress)
      setResult(scanResult)
    } catch (error) {
      console.error("Scan failed:", error)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="popup-container">
      <div className="header">
        <h1 className="title">Scathat</h1>
        <p className="subtitle">Contract Security Scanner</p>
      </div>

      <div className="content">
        {!result ? (
          <div className="scanner-panel">
            <input
              type="text"
              placeholder="Paste contract address..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="input"
              disabled={isScanning}
            />
            <button onClick={handleScan} disabled={isScanning || !contractAddress.trim()} className="btn btn-primary">
              {isScanning ? "Scanning..." : "Scan Contract"}
            </button>
          </div>
        ) : (
          <div className="result-panel">
            <div className={`risk-badge risk-${result.riskLevel}`}>{result.riskLevel.toUpperCase()}</div>
            <p className="result-address">{result.address}</p>
            <div className="risk-details">
              <div className="detail-row">
                <span>Vulnerabilities:</span>
                <span className="value">{result.vulnerabilities}</span>
              </div>
              <div className="detail-row">
                <span>Functions:</span>
                <span className="value">{result.functions}</span>
              </div>
              <div className="detail-row">
                <span>Score:</span>
                <span className="value score">{result.score}%</span>
              </div>
            </div>
            <button onClick={() => setResult(null)} className="btn btn-secondary">
              Scan Another
            </button>
          </div>
        )}
      </div>

      <div className="footer">
        <a href="https://scathat.io" target="_blank" rel="noopener noreferrer">
          Full Dashboard
        </a>
      </div>
    </div>
  )
}

export default Popup
