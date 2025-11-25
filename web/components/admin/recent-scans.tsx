"use client"

/**
 * Recent Scans Component
 *
 * Displays latest contract scans on the platform.
 */

import { CheckCircle2, AlertCircle, XCircle } from "lucide-react"

export function RecentScans() {
  const scans = [
    {
      id: "scan_001",
      contract: "0x1234...5678",
      status: "SAFE",
      score: 95,
      user: "0xabcd...ef01",
      timestamp: "2 min ago",
    },
    {
      id: "scan_002",
      contract: "0x2345...6789",
      status: "WARNING",
      score: 62,
      user: "0xbcde...f012",
      timestamp: "5 min ago",
    },
    {
      id: "scan_003",
      contract: "0x3456...7890",
      status: "DANGEROUS",
      score: 15,
      user: "0xcdef...0123",
      timestamp: "8 min ago",
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "SAFE":
        return <CheckCircle2 size={18} className="text-green-400" />
      case "WARNING":
        return <AlertCircle size={18} className="text-yellow-400" />
      case "DANGEROUS":
        return <XCircle size={18} className="text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="bg-[color:--color-surface] border border-[color:--color-border] rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">Recent Scans</h3>
      <div className="space-y-3">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className="flex items-center justify-between p-3 bg-[color:--color-surface-light] rounded-lg border border-[color:--color-border]"
          >
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(scan.status)}
              <div>
                <p className="font-mono text-sm text-white">{scan.contract}</p>
                <p className="text-xs text-[color:--color-text-secondary]">{scan.timestamp}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[color:--color-primary]">{scan.score}</p>
              <p className="text-xs text-[color:--color-text-secondary]">{scan.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
