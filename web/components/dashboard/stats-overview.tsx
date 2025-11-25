"use client"

import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

export function StatsOverview() {
  return (
    <div className="space-y-4">
      <div className="bg-background/50 border border-border/40 rounded-lg p-6 hover:border-cyan-600/50 transition-all duration-300 group cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-2 group-hover:text-cyan-400 transition-colors">
              Total Scans
            </div>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-2">Lifetime scans</p>
          </div>
          <TrendingUp className="h-8 w-8 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>

      <div className="bg-background/50 border border-border/40 rounded-lg p-6 hover:border-orange-600/50 transition-all duration-300 group cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-2 group-hover:text-orange-400 transition-colors">
              Risks Found
            </div>
            <div className="text-3xl font-bold text-orange-400">0</div>
            <p className="text-xs text-muted-foreground mt-2">Vulnerabilities detected</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-muted-foreground group-hover:text-orange-400 transition-colors" />
        </div>
      </div>

      <div className="bg-background/50 border border-border/40 rounded-lg p-6 hover:border-green-600/50 transition-all duration-300 group cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-2 group-hover:text-green-400 transition-colors">
              Avg. Score
            </div>
            <div className="text-3xl font-bold text-green-400">—</div>
            <p className="text-xs text-muted-foreground mt-2">Safety rating</p>
          </div>
          <CheckCircle className="h-8 w-8 text-muted-foreground group-hover:text-green-400 transition-colors" />
        </div>
      </div>
    </div>
  )
}
