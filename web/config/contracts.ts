/**
 * Smart Contract Configuration
 *
 * Centralized configuration for all smart contract interactions
 *
 * Update these values after deploying RiskRegistry contract
 * Store sensitive values in environment variables
 */

export const CONTRACT_CONFIG = {
  // RiskRegistry contract address (deployed on blockchain)
  // Update this after deployment - see DEPLOYMENT_GUIDE.md
  registry: {
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "",
    chainId: Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111"), // Default: Sepolia
  },

  // Network configurations
  networks: {
    sepolia: {
      chainId: 11155111,
      name: "Ethereum Sepolia (Testnet)",
      rpcUrl: "https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY",
    },
    mainnet: {
      chainId: 1,
      name: "Ethereum Mainnet",
      rpcUrl: "https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY",
    },
    polygon: {
      chainId: 137,
      name: "Polygon Mainnet",
      rpcUrl: "https://polygon-rpc.com",
    },
    mumbai: {
      chainId: 80001,
      name: "Polygon Mumbai (Testnet)",
      rpcUrl: "https://rpc-mumbai.maticvigil.com",
    },
  },

  // Risk level colors for UI
  riskColors: {
    SAFE: "#10b981", // Green
    LOW_RISK: "#3b82f6", // Blue
    MEDIUM_RISK: "#f59e0b", // Amber
    HIGH_RISK: "#ef6544", // Orange
    CRITICAL: "#dc2626", // Red
    UNKNOWN: "#6b7280", // Gray
  },

  // Risk level labels
  riskLabels: {
    SAFE: "Safe",
    LOW_RISK: "Low Risk",
    MEDIUM_RISK: "Medium Risk",
    HIGH_RISK: "High Risk",
    CRITICAL: "Critical",
    UNKNOWN: "Unknown",
  },
}

/**
 * Get current network configuration
 */
export function getNetworkConfig() {
  const chainId = CONTRACT_CONFIG.registry.chainId
  const networks = Object.values(CONTRACT_CONFIG.networks)
  return networks.find((n) => n.chainId === chainId)
}

/**
 * Get color for risk level
 */
export function getRiskColor(riskLevel: string): string {
  return (
    CONTRACT_CONFIG.riskColors[riskLevel as keyof typeof CONTRACT_CONFIG.riskColors] ||
    CONTRACT_CONFIG.riskColors.UNKNOWN
  )
}

/**
 * Get label for risk level
 */
export function getRiskLabel(riskLevel: string): string {
  return CONTRACT_CONFIG.riskLabels[riskLevel as keyof typeof CONTRACT_CONFIG.riskLabels] || "Unknown"
}
