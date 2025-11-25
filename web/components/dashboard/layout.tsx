"use client"

import type React from "react"

import { useState } from "react"
import { Menu, X } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0"} bg-background/50 border-r border-border/40 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6 space-y-6">
          <h2 className="font-bold text-lg text-cyan-400">Scathat Dashboard</h2>
          <nav className="space-y-2">
            <div className="px-4 py-2 text-sm text-muted-foreground">Menu items here</div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 border-b border-border/40 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
