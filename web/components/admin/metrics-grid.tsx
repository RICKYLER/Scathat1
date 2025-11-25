"use client"

/**
 * Metrics Grid Component
 *
 * Displays key KPIs for platform monitoring.
 */

import { TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

export function MetricsGrid({ metrics }) {
  const gridMetrics = [
    {
      label: "Total Scans (24h)",
      value: metrics?.scans_24h || "0",
      change: "+12.5%",
      positive: true,
      icon: CheckCircle2,
    },
    {
      label: "Active Users",
      value: metrics?.active_users || "0",
      change: "+8.2%",
      positive: true,
      icon: TrendingUp,
    },
    {
      label: "Threats Detected",
      value: metrics?.threats_detected || "0",
      change: "-2.1%",
      positive: false,
      icon: AlertCircle,
    },
    {
      label: "System Uptime",
      value: metrics?.uptime || "99.9%",
      change: "Stable",
      positive: true,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {gridMetrics.map((metric, idx) => {
        const Icon = metric.icon
        return (
          <div
            key={idx}
            className="bg-[color:--color-surface] border border-[color:--color-border] rounded-lg p-6 hover:border-[color:--color-primary]/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-[color:--color-text-secondary] mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-white">{metric.value}</p>
              </div>
              <Icon size={24} className={metric.positive ? "text-green-400" : "text-red-400"} />
            </div>
            <p className={`text-sm ${metric.positive ? "text-green-400" : "text-red-400"}`}>{metric.change}</p>
          </div>
        )
      })}
    </div>
  )
}
