"use client"
import { Settings, LogOut, Bell } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[color:--color-surface] border-b border-[color:--color-border] backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[color:--color-primary] to-emerald-600 rounded-lg"></div>
          <h1 className="text-xl font-bold text-white">Scathat Admin</h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[color:--color-surface-light] rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-[color:--color-surface-light] rounded-lg transition-colors">
            <Settings size={20} />
          </button>
          <button className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-red-400">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
