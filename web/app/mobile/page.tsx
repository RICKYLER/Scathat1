"use client"

/**
 * Mobile Home Page
 * Optimized interface for mobile devices
 */

import MobileLayout from "./layout"
import { ArrowRight, TrendingUp, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function MobileHome() {
  const [contractAddress, setContractAddress] = useState("")

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Quick scan card */}
        <div className="bg-(--card) border border-(--border) rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4">Quick Scan</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Contract address"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="input-field text-sm"
            />
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              Scan <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Recent scans */}
        <div className="bg-(--card) border border-(--border) rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4">Recent Scans</h2>
          <div className="space-y-3">
            {[
              { addr: "0x1234...5678", status: "Safe", score: 95 },
              { addr: "0xabcd...efgh", status: "Warning", score: 62 },
              { addr: "0x9876...5432", status: "Danger", score: 15 },
            ].map((scan, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-(--surface) rounded-lg">
                <div>
                  <p className="text-sm font-medium">{scan.addr}</p>
                  <p className="text-xs text-(--muted)">{scan.status}</p>
                </div>
                <span className="font-bold text-(--primary)">{scan.score}/100</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Scans Today", value: "8", icon: TrendingUp },
            { label: "Threats", value: "2", icon: AlertCircle },
          ].map((stat, idx) => (
            <div key={idx} className="bg-(--card) border border-(--border) rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2 text-(--primary)">
                <stat.icon size={24} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-(--muted)">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}
