/**
 * TypeScript types for smart contract integration
 *
 * These types provide type safety when working with contract data
 */

export type RiskLevel = "SAFE" | "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK" | "CRITICAL" | "UNKNOWN"

export interface RiskAssessment {
  address: string
  level: RiskLevel
  score?: number
  details?: string
  timestamp?: number
}

export interface ContractInfo {
  address: string
  maxScoreLength: number
}

export interface WriteScoreResult {
  success: boolean
  txHash?: string
  error?: string
}

export interface RiskScoreEvent {
  targetContract: string
  riskScore: string
  writer: string
  timestamp: number
}
