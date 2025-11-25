"use client"

import { AuthForm } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/layout"

export default function AuthPage() {
  return (
    <AuthLayout>
      <AuthForm />
    </AuthLayout>
  )
}
