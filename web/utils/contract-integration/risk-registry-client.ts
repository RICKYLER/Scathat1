/**
 * RiskRegistry Contract Client
 *
 * This utility provides a TypeScript client for interacting with the RiskRegistry contract.
 * Handles connection, reading scores, writing scores (for authorized services), and event monitoring.
 *
 * Usage:
 * const client = new RiskRegistryClient(REGISTRY_ADDRESS);
 * const score = await client.getRiskScore(contractAddress);
 */

import { ethers, type Contract, type Provider, type BrowserProvider } from "ethers"
import type { RiskAssessment, RiskLevel } from "../types/contract-types"

// Import the ABI from the compiled contract
import REGISTRY_ABI from "@/contracts/abi/RiskRegistry.json"

/**
 * Risk level classifications based on common naming patterns
 */
const RISK_LEVEL_MAP: Record<string, RiskLevel> = {
  SAFE: "SAFE",
  LOW_RISK: "LOW_RISK",
  MEDIUM_RISK: "MEDIUM_RISK",
  HIGH_RISK: "HIGH_RISK",
  MALICIOUS: "CRITICAL",
  DANGEROUS: "CRITICAL",
  CRITICAL: "CRITICAL",
  UNKNOWN: "UNKNOWN",
}

interface RiskRegistryConfig {
  contractAddress: string
  rpcUrl?: string
  web3Provider?: BrowserProvider
}

export class RiskRegistryClient {
  private contract: Contract | null = null
  private contractAddress: string
  private provider: Provider | BrowserProvider
  private isConnected = false

  constructor(config: RiskRegistryConfig) {
    this.contractAddress = config.contractAddress

    // Prefer web3 provider (for browser), fall back to RPC URL
    if (config.web3Provider) {
      this.provider = config.web3Provider
    } else if (config.rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl)
    } else {
      throw new Error("Either web3Provider or rpcUrl must be provided")
    }

    this.initializeContract()
  }

  /**
   * Initialize the contract instance
   */
  private initializeContract(): void {
    try {
      this.contract = new ethers.Contract(this.contractAddress, REGISTRY_ABI, this.provider)
      this.isConnected = true
    } catch (error) {
      console.error("[RiskRegistry] Failed to initialize contract:", error)
      this.isConnected = false
    }
  }

  /**
   * Check if client is connected to contract
   */
  public getConnectionStatus(): boolean {
    return this.isConnected && this.contract !== null
  }

  /**
   * Get risk score for a contract address
   *
   * @param targetContract Address of the contract to check
   * @returns Risk assessment object or null if no score exists
   *
   * Example:
   * const assessment = await client.getRiskScore("0x123...");
   * if (assessment?.level === "SAFE") {
   *   // Safe to interact with
   * }
   */
  public async getRiskScore(targetContract: string): Promise<RiskAssessment | null> {
    if (!this.contract) {
      console.error("[RiskRegistry] Contract not initialized")
      return null
    }

    try {
      // Call the contract's getRiskScore function
      const scoreString: string = await this.contract.getRiskScore(targetContract)

      // Empty string means no score exists
      if (!scoreString || scoreString === "") {
        return {
          address: targetContract,
          level: "UNKNOWN",
          details: "No risk assessment available",
        }
      }

      // Parse the risk assessment
      return this.parseRiskScore(targetContract, scoreString)
    } catch (error) {
      console.error("[RiskRegistry] Error fetching risk score:", error)
      return null
    }
  }

  /**
   * Parse a risk score string into a structured assessment
   *
   * Handles various formats:
   * - "SAFE" → level: "SAFE"
   * - "HIGH_RISK" → level: "HIGH_RISK"
   * - "score: 85" → level calculated from score
   * - "MEDIUM_RISK_REENTRANCY" → level: "MEDIUM_RISK"
   */
  private parseRiskScore(address: string, scoreString: string): RiskAssessment {
    // Extract numeric score if present (e.g., "score: 85")
    const scoreMatch = scoreString.match(/\d+/)
    const numericScore = scoreMatch ? Number.parseInt(scoreMatch[0], 10) : undefined

    // Determine risk level from string
    let riskLevel: RiskLevel = "UNKNOWN"
    for (const [key, level] of Object.entries(RISK_LEVEL_MAP)) {
      if (scoreString.toUpperCase().includes(key)) {
        riskLevel = level
        break
      }
    }

    return {
      address,
      level: riskLevel,
      score: numericScore,
      details: scoreString,
      timestamp: Date.now(),
    }
  }

  /**
   * Check if a risk score exists for a contract
   *
   * @param targetContract Address to check
   * @returns True if score exists, false otherwise
   */
  public async hasRiskScore(targetContract: string): Promise<boolean> {
    if (!this.contract) return false

    try {
      return await this.contract.hasRiskScore(targetContract)
    } catch (error) {
      console.error("[RiskRegistry] Error checking if score exists:", error)
      return false
    }
  }

  /**
   * Get multiple risk scores efficiently
   *
   * @param contracts Array of contract addresses
   * @returns Array of risk assessments
   *
   * Use this instead of calling getRiskScore multiple times
   */
  public async getRiskScoreBatch(contracts: string[]): Promise<RiskAssessment[]> {
    const results = await Promise.all(contracts.map((address) => this.getRiskScore(address)))
    return results.filter((result): result is RiskAssessment => result !== null)
  }

  /**
   * Write a new risk score (requires authorization and signer)
   *
   * @param targetContract Address being scored
   * @param riskScore Risk assessment string
   * @param signer Authorized signer (owner or authorized writer)
   * @returns Transaction hash on success
   *
   * Example:
   * const signer = await getSigner();
   * const txHash = await client.writeRiskScore(
   *   "0x123...",
   *   "SAFE",
   *   signer
   * );
   */
  public async writeRiskScore(targetContract: string, riskScore: string, signer: ethers.Signer): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      // Connect contract to signer for transaction signing
      const contractWithSigner = this.contract.connect(signer)

      // Call writeRiskScore function
      const tx = await contractWithSigner.writeRiskScore(targetContract, riskScore)

      // Wait for transaction confirmation
      const receipt = await tx.wait()

      if (!receipt) {
        throw new Error("Transaction failed")
      }

      console.log("[RiskRegistry] Score written successfully:", receipt.hash)
      return receipt.hash
    } catch (error) {
      console.error("[RiskRegistry] Error writing risk score:", error)
      throw error
    }
  }

  /**
   * Update an existing risk score (owner only)
   *
   * @param targetContract Address being updated
   * @param newRiskScore New risk assessment
   * @param signer Owner signer
   * @returns Transaction hash on success
   */
  public async updateRiskScore(targetContract: string, newRiskScore: string, signer: ethers.Signer): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const contractWithSigner = this.contract.connect(signer)
      const tx = await contractWithSigner.updateRiskScore(targetContract, newRiskScore)

      const receipt = await tx.wait()
      if (!receipt) throw new Error("Transaction failed")

      console.log("[RiskRegistry] Score updated successfully:", receipt.hash)
      return receipt.hash
    } catch (error) {
      console.error("[RiskRegistry] Error updating risk score:", error)
      throw error
    }
  }

  /**
   * Remove a risk score (owner only, emergency use)
   */
  public async removeRiskScore(targetContract: string, signer: ethers.Signer): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const contractWithSigner = this.contract.connect(signer)
      const tx = await contractWithSigner.removeRiskScore(targetContract)

      const receipt = await tx.wait()
      if (!receipt) throw new Error("Transaction failed")

      return receipt.hash
    } catch (error) {
      console.error("[RiskRegistry] Error removing risk score:", error)
      throw error
    }
  }

  /**
   * Listen for risk score events in real-time
   *
   * @param onScoreWritten Callback when new score is written
   * @param onScoreUpdated Callback when score is updated
   * @returns Function to stop listening
   *
   * Example:
   * const unsubscribe = client.listenToScoreUpdates(
   *   (event) => console.log("New score:", event),
   *   (event) => console.log("Updated score:", event)
   * );
   */
  public listenToScoreUpdates(
    onScoreWritten?: (event: any) => void,
    onScoreUpdated?: (event: any) => void,
  ): () => void {
    if (!this.contract) {
      console.error("Contract not initialized")
      return () => {}
    }

    // Listen to events
    if (onScoreWritten) {
      this.contract.on("RiskScoreWritten", onScoreWritten)
    }
    if (onScoreUpdated) {
      this.contract.on("RiskScoreUpdated", onScoreUpdated)
    }

    // Return unsubscribe function
    return () => {
      if (onScoreWritten) this.contract?.removeListener("RiskScoreWritten", onScoreWritten)
      if (onScoreUpdated) this.contract?.removeListener("RiskScoreUpdated", onScoreUpdated)
    }
  }

  /**
   * Get contract configuration (read-only info)
   */
  public async getContractInfo(): Promise<{
    address: string
    maxScoreLength: number
  }> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const maxLength = await this.contract.MAX_RISK_SCORE_LENGTH()
      return {
        address: this.contractAddress,
        maxScoreLength: Number(maxLength),
      }
    } catch (error) {
      console.error("[RiskRegistry] Error getting contract info:", error)
      throw error
    }
  }
}

/**
 * Helper: Create client for browser environments
 */
export async function createBrowserClient(registryAddress: string) {
  if (!window.ethereum) {
    throw new Error("Web3 provider not found. Please install MetaMask or similar.")
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  return new RiskRegistryClient({
    contractAddress: registryAddress,
    web3Provider: provider,
  })
}

/**
 * Helper: Create client for Node.js environments
 */
export function createNodeClient(registryAddress: string, rpcUrl: string) {
  return new RiskRegistryClient({
    contractAddress: registryAddress,
    rpcUrl,
  })
}
