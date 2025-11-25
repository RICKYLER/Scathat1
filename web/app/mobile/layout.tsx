"use client"

import type React from "react"

/**
 * Mobile Layout Component
 * Optimized layout for mobile devices with bottom navigation
 */

import { Home, Search, User, Settings, Bell } from "lucide-react"
import { useState } from "react"

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [activeNav, setActiveNav] = useState("home")

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "scan", label: "Scan", icon: Search },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-(--background) flex flex-col">
      {/* Top header */}
      <div className="bg-(--card) border-b border-(--border) px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-lg font-bold">Scathat</h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-(--surface) rounded-lg transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto pb-20 px-4 py-4">{children}</div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-(--card) border-t border-(--border) px-4 py-3">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                activeNav === item.id ? "text-(--primary)" : "text-(--muted) hover:text-(--foreground)"
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
