"use client"

/**
 * Header Navigation Component
 *
 * Sticky navigation bar displayed at the top of all pages. Features:
 * - Responsive design (desktop menu vs mobile hamburger)
 * - Logo/brand link to home
 * - Navigation links to main sections
 * - Authentication link
 * - Get Extension CTA button
 *
 * Mobile behavior: Hamburger menu that toggles dropdown with all options
 */

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  // Track mobile menu open/closed state
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Brand/Logo - links to home */}
        <Link href="/" className="font-bold text-xl text-cyan-400">
          Scathat
        </Link>

        {/* Desktop Navigation Menu - visible on md screens and up */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm hover:text-cyan-400 transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm hover:text-cyan-400 transition-colors">
            How It Works
          </Link>
          <Link href="#pricing" className="text-sm hover:text-cyan-400 transition-colors">
            Pricing
          </Link>
          <Link href="/auth" className="text-sm hover:text-cyan-400 transition-colors">
            Sign In
          </Link>
          <Button className="bg-cyan-600 hover:bg-cyan-700">Get Extension</Button>
        </div>

        {/* Mobile Menu Toggle Button - only visible on small screens */}
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown - only shows when toggled on mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border/40 px-4 py-4 space-y-4">
          <Link href="#features" className="block text-sm hover:text-cyan-400">
            Features
          </Link>
          <Link href="#how-it-works" className="block text-sm hover:text-cyan-400">
            How It Works
          </Link>
          <Link href="#pricing" className="block text-sm hover:text-cyan-400">
            Pricing
          </Link>
          <Link href="/auth" className="block text-sm hover:text-cyan-400">
            Sign In
          </Link>
          <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Get Extension</Button>
        </div>
      )}
    </header>
  )
}
