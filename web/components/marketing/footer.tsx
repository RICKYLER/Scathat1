import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Scathat</h3>
            <p className="text-sm text-muted-foreground">AI-powered smart contract security.</p>
          </div>
          <div>
            <h4 className="font-bold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-cyan-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-cyan-400">
                  Security
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-cyan-400">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-cyan-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-cyan-400">
                  Docs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-cyan-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-cyan-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-cyan-400">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-cyan-400">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 Scathat. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-cyan-400">
              Twitter
            </Link>
            <Link href="#" className="hover:text-cyan-400">
              Discord
            </Link>
            <Link href="#" className="hover:text-cyan-400">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
