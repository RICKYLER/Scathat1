import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Scathat — Web3 Security Shield',
  description:
    'AI-powered real-time smart contract analysis and on-chain enforcement to protect users from hacks, rugpulls, and malicious approvals.',
  icons: {
    icon: '/logo1.jpg',
    shortcut: '/logo1.jpg',
    apple: '/logo1.jpg',
  },
  openGraph: {
    title: 'Scathat — Web3 Security Shield',
    description:
      'AI-powered real-time smart contract analysis and on-chain enforcement to protect users from hacks, rugpulls, and malicious approvals.',
    images: ['/logo1.jpg'],
    type: 'website',
    url: 'https://localhost:3000',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scathat — Web3 Security Shield',
    description:
      'AI-powered real-time smart contract analysis and on-chain enforcement to protect users from hacks, rugpulls, and malicious approvals.',
    images: ['/logo1.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
