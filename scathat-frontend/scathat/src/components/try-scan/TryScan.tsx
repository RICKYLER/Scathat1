"use client"

import Header from "@/components/try-scan/Header"
import ScannerInterface from "@/components/try-scan/scanner-interface"

export default function TryScan() {
  return (
    <>
      <Header minimal />
      <main className="min-h-screen bg-background">
        <div className="container px-4 md:px-6 py-24">
          <ScannerInterface />
        </div>
      </main>
    </>
  )
}
