"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="bg-background/50 border border-border/40 rounded-lg p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Scathat</h1>
        <p className="text-muted-foreground">{isLogin ? "Sign in to your account" : "Create new account"}</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border/40 rounded-lg focus:outline-none focus:border-cyan-600"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border/40 rounded-lg focus:outline-none focus:border-cyan-600"
            placeholder="••••••••"
          />
        </div>
        <Button className="w-full bg-cyan-600 hover:bg-cyan-700">{isLogin ? "Sign In" : "Create Account"}</Button>
      </form>

      <div className="text-center">
        <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-cyan-400 hover:text-cyan-300">
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  )
}
