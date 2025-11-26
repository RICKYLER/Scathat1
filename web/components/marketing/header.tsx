"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-cyan-400">Scathat</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#pricing" className="text-sm hover:text-cyan-400 transition-colors">Download</Link>
          <Link href="#how-it-works" className="text-sm hover:text-cyan-400 transition-colors">Learn</Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border/40 px-4 py-4 space-y-4">
          <Link href="#pricing" className="block text-sm hover:text-cyan-400">Download</Link>
          <Link href="#how-it-works" className="block text-sm hover:text-cyan-400">Learn</Link>
        </div>
      )}
    </header>
  )
}
