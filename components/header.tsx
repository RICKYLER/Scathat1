"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            S
          </div>
          <span className="font-bold text-lg text-foreground">Scathat</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden gap-8 md:flex">
          <Link href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition">
            Problem
          </Link>
          <Link href="#solution" className="text-sm text-muted-foreground hover:text-foreground transition">
            Solution
          </Link>
          <Link href="#how" className="text-sm text-muted-foreground hover:text-foreground transition">
            How It Works
          </Link>
          <Link href="#download" className="text-sm text-muted-foreground hover:text-foreground transition">
            Download
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Button className="hidden md:flex">Get Started</Button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card p-4">
          <nav className="flex flex-col gap-4">
            <Link href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition">
              Problem
            </Link>
            <Link href="#solution" className="text-sm text-muted-foreground hover:text-foreground transition">
              Solution
            </Link>
            <Link href="#how" className="text-sm text-muted-foreground hover:text-foreground transition">
              How It Works
            </Link>
            <Link href="#download" className="text-sm text-muted-foreground hover:text-foreground transition">
              Download
            </Link>
            <Button className="w-full">Get Started</Button>
          </nav>
        </div>
      )}
    </header>
  )
}
