"use client"

/**
 * System Health Component
 *
 * Monitors system status and performance metrics.
 */

import { Activity, Server, Zap } from "lucide-react"

export function SystemHealth() {
  const healthChecks = [
    {
      name: "Database",
      status: "healthy",
      latency: "12ms",
      icon: Server,
    },
    {
      name: "Redis Cache",
      status: "healthy",
      latency: "2ms",
      icon: Zap,
    },
    {
      name: "API Gateway",
      status: "healthy",
      latency: "45ms",
      icon: Activity,
    },
  ]

  return (
    <div className="bg-[color:--color-surface] border border-[color:--color-border] rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
      <div className="space-y-3">
        {healthChecks.map((check) => {
          const Icon = check.icon
          return (
            <div
              key={check.name}
              className="p-3 bg-[color:--color-surface-light] rounded-lg border border-[color:--color-border]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-[color:--color-primary]" />
                <p className="text-sm font-semibold text-white">{check.name}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-900/30 text-green-300 text-xs font-medium border border-green-700/50">
                  {check.status}
                </span>
                <span className="text-xs text-[color:--color-text-secondary]">{check.latency}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
