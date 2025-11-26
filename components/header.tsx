"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">S</div>
          <span className="font-bold text-lg text-foreground">Scathat</span>
        </div>

        <nav className="hidden gap-8 md:flex">
          <Link href="#download" className="text-sm text-muted-foreground hover:text-foreground transition">Download</Link>
          <Link href="#how" className="text-sm text-muted-foreground hover:text-foreground transition">Learn</Link>
        </nav>

        <div className="hidden md:flex">
          <button
            className="rounded-md border border-border p-2 hover:bg-card/50"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Open navigation">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-card p-4">
          <nav className="flex flex-col gap-4">
            <Link href="#download" className="text-sm text-muted-foreground hover:text-foreground transition">Download</Link>
            <Link href="#how" className="text-sm text-muted-foreground hover:text-foreground transition">Learn</Link>
            <button
              className="rounded-md border border-border p-2 hover:bg-card/50"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}

