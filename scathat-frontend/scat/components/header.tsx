"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9">
            {/* Inline SVG logo using LogoFramed icon-only styling */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="36" height="36" aria-hidden="true">
              <defs>
                <radialGradient id="logo-g" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#0b1226" />
                  <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>
              </defs>
              <circle cx="150" cy="150" r="90" fill="url(#logo-g)" />
              <circle cx="150" cy="150" r="90" fill="none" stroke="#ff5bd3" strokeWidth="10" />
              <g transform="translate(150,150)">
                <polygon points="0,-45 -38,-18 -20,40 0,58 20,40 38,-18" fill="#0b1020" />
                <ellipse cx="0" cy="6" rx="23" ry="13" fill="#ffffff" />
                <circle cx="0" cy="6" r="11" fill="#e11d48" />
                <circle cx="0" cy="6" r="5.5" fill="#0f172a" />
                <circle cx="2.2" cy="3.8" r="2" fill="#ffffff" opacity="0.85" />
                <g transform="rotate(-8)">
                  <ellipse cx="0" cy="-52" rx="58" ry="9" fill="#0f172a" opacity="0.95" />
                  <polygon points="-25,-88 25,-88 35,-65 -35,-65" fill="#0f172a" />
                  <rect x="-27" y="-74" width="54" height="7" fill="#ffffff" />
                </g>
              </g>
            </svg>
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
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} suppressHydrationWarning>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Button className="hidden md:flex" suppressHydrationWarning>Get Started</Button>
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
