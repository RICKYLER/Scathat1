export interface ContractScanResult {
  address: string
  riskLevel: "safe" | "warning" | "dangerous"
  score: number
  vulnerabilities: number
  functions: number
  timestamp: number
  details: {
    owner: string
    totalSupply: string
    verified: boolean
  }
}

export interface ScanError {
  code: string
  message: string
}

export interface ExtensionMessage {
  action: string
  contractAddress?: string
  data?: any
}
