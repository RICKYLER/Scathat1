/**
 * Root Layout Component
 *
 * This is the outermost layout that wraps all pages in the application.
 * Responsibilities:
 * - Set up global HTML structure
 * - Configure metadata (title, description for SEO)
 * - Import global styles and fonts
 * - Set up viewport configuration for responsive design
 */

import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "@/styles/globals.css"

// Configure sans-serif font from Google Fonts
const geistSans = Geist({ subsets: ["latin"] })

// Configure monospace font from Google Fonts (used for code/technical content)
const geistMono = Geist_Mono({ subsets: ["latin"] })

// SEO metadata - shown in search results and social media
export const metadata: Metadata = {
  title: "Scathat - Smart Contract Security AI",
  description:
    "AI-powered security analysis for smart contracts. Protect yourself from malicious code with intelligent scanning.",
  icons: {
    icon: "/favicon.ico",
  },
}

// Viewport configuration - ensures proper scaling on mobile devices
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

/**
 * RootLayout Props
 * @param children - The page content that will be rendered inside this layout
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${geistMono.className}`}>{children}</body>
    </html>
  )
}
