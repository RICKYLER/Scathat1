"use client"

/**
 * Admin Dashboard Page
 *
 * Central hub for monitoring platform metrics, managing scans,
 * and overseeing platform health. Accessible only to authorized admins.
 */

import { AdminHeader } from "@/components/admin/admin-header"
import { MetricsGrid } from "@/components/admin/metrics-grid"
import { RecentScans } from "@/components/admin/recent-scans"
import { UserActivity } from "@/components/admin/user-activity"
import { SystemHealth } from "@/components/admin/system-health"
import { useState, useEffect } from "react"

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch admin metrics
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/admin/metrics")
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[color:--color-background] flex items-center justify-center">
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[color:--color-background]">
      <AdminHeader />
      <div className="container mx-auto p-6 space-y-6">
        <MetricsGrid metrics={metrics} />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentScans />
          </div>
          <div>
            <SystemHealth />
          </div>
        </div>
        <UserActivity />
      </div>
    </div>
  )
}
