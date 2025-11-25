/**
 * Custom React Hook for RiskRegistry Contract Interaction
 *
 * Provides easy access to risk assessment data with React patterns:
 * - Automatic caching
 * - Loading states
 * - Error handling
 * - Real-time updates via events
 *
 * Usage:
 * const { risk, loading, error } = useRiskScore("0x123...");
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import type { RiskAssessment } from "@/utils/types/contract-types"
import { createBrowserClient } from "@/utils/contract-integration/risk-registry-client"
import { REGISTRY_ADDRESS } from "@/config/contracts"

interface UseRiskScoreResult {
  risk: RiskAssessment | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook: Get risk score for a single contract address
 */
export function useRiskScore(contractAddress: string): UseRiskScoreResult {
  const [risk, setRisk] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRisk = useCallback(async () => {
    if (!contractAddress || !REGISTRY_ADDRESS) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const client = await createBrowserClient(REGISTRY_ADDRESS)
      const assessment = await client.getRiskScore(contractAddress)
      setRisk(assessment)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
      setRisk(null)
    } finally {
      setLoading(false)
    }
  }, [contractAddress])

  useEffect(() => {
    fetchRisk()
  }, [fetchRisk])

  return { risk, loading, error, refetch: fetchRisk }
}

/**
 * Hook: Get risk scores for multiple contracts
 */
export function useRiskScoreBatch(contractAddresses: string[]) {
  const [risks, setRisks] = useState<RiskAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRisks = useCallback(async () => {
    if (!contractAddresses.length || !REGISTRY_ADDRESS) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const client = await createBrowserClient(REGISTRY_ADDRESS)
      const assessments = await client.getRiskScoreBatch(contractAddresses)
      setRisks(assessments)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
      setRisks([])
    } finally {
      setLoading(false)
    }
  }, [contractAddresses])

  useEffect(() => {
    fetchRisks()
  }, [fetchRisks])

  return { risks, loading, error, refetch: fetchRisks }
}

/**
 * Hook: Listen to real-time risk score updates
 */
export function useRiskScoreUpdates(onUpdate?: (risk: RiskAssessment) => void) {
  const [events, setEvents] = useState<any[]>([])
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const setup = async () => {
      try {
        if (!REGISTRY_ADDRESS) return

        const client = await createBrowserClient(REGISTRY_ADDRESS)

        unsubscribe = client.listenToScoreUpdates((event) => {
          setEvents((prev) => [event, ...prev.slice(0, 9)])
          if (onUpdate) {
            onUpdate({
              address: event.targetContract,
              level: event.riskScore as any,
              details: event.riskScore,
              timestamp: event.timestamp,
            })
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      }
    }

    setup()

    return () => {
      unsubscribe?.()
    }
  }, [onUpdate])

  return { events, error }
}

/**
 * Hook: Write a new risk score (requires signer)
 */
export function useWriteRiskScore() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const write = useCallback(async (contractAddress: string, riskScore: string, signer: any) => {
    if (!REGISTRY_ADDRESS) {
      throw new Error("Contract address not configured")
    }

    try {
      setLoading(true)
      setError(null)

      const client = await createBrowserClient(REGISTRY_ADDRESS)
      const hash = await client.writeRiskScore(contractAddress, riskScore, signer)

      setTxHash(hash)
      return hash
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { write, loading, error, txHash }
}
