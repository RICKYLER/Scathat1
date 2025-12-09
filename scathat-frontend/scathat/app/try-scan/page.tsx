"use client"
import ScannerInterface from "@/components/try-scan/scanner-interface"

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="container px-4 md:px-6 py-24">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Try Scan</h1>
          <p className="text-muted-foreground mt-2">Analyze a smart contract address with Scathat Scanner</p>
        </div>
        <ScannerInterface />
      </div>
    </main>
  )
}
