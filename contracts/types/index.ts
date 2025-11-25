/**
 * TypeScript types and interfaces for RiskRegistry contract
 *
 * These types ensure type safety when interacting with the contract
 * from TypeScript/JavaScript code
 */

export interface RiskScore {
  contractAddress: string
  score: string
  writer: string
  timestamp: number
  exists: boolean
}

export interface RegistryConfig {
  contractAddress: string
  owner: string
  maxScoreLength: number
}

export interface WriteScoreParams {
  targetContract: string
  riskScore: string
}

export interface UpdateScoreParams {
  targetContract: string
  newRiskScore: string
}

export type RiskLevel = "SAFE" | "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK" | "CRITICAL" | "UNKNOWN"

export interface RiskAssessment {
  address: string
  level: RiskLevel
  score?: number
  details?: string
  timestamp?: number
}
