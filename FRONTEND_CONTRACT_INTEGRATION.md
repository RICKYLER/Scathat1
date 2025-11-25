# Frontend Contract Integration Guide

This guide shows how to integrate the RiskRegistry smart contract into your Scathat web/extension frontend.

## Installation

### 1. Copy Files

Copy these files into your project:

\`\`\`
web/
├── utils/
│   ├── contract-integration/
│   │   └── risk-registry-client.ts
│   └── types/
│       └── contract-types.ts
└── config/
    └── contracts.ts (create this)
\`\`\`

### 2. Create Contract Configuration

Create \`web/config/contracts.ts\`:

\`\`\`typescript
/**
 * Smart Contract Configuration
 * 
 * Update these values after contract deployment
 */

// Deployed RiskRegistry address (from deployment output)
export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "";

// RPC URL for blockchain interactions
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY";

// Contract deployment info
export const CONTRACT_CONFIG = {
  address: REGISTRY_ADDRESS,
  chainId: 11155111, // Sepolia (change to 1 for mainnet)
  rpcUrl: RPC_URL,
};
\`\`\`

### 3. Add Environment Variables

Create \`.env.local\`:

\`\`\`env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY
\`\`\`

## Usage Examples

### Example 1: Check Contract Risk (Read-Only)

No wallet or gas required:

\`\`\`typescript
"use client";

import { createBrowserClient } from "@/utils/contract-integration/risk-registry-client";
import { REGISTRY_ADDRESS } from "@/config/contracts";
import { useEffect, useState } from "react";

export function RiskChecker({ contractAddress }: { contractAddress: string }) {
  const [riskLevel, setRiskLevel] = useState<string>("UNKNOWN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRisk() {
      try {
        // Create client (read-only mode)
        const client = await createBrowserClient(REGISTRY_ADDRESS);
        
        // Get risk assessment
        const assessment = await client.getRiskScore(contractAddress);
        
        if (assessment) {
          setRiskLevel(assessment.level);
        }
      } catch (error) {
        console.error("Failed to check risk:", error);
      } finally {
        setLoading(false);
      }
    }

    checkRisk();
  }, [contractAddress]);

  if (loading) return <div>Checking risk...</div>;
  
  return (
    <div className={`risk-badge risk-${riskLevel.toLowerCase()}`}>
      {riskLevel}
    </div>
  );
}
\`\`\`

### Example 2: Dashboard with Real-Time Updates

Listen to contract events:

\`\`\`typescript
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/utils/contract-integration/risk-registry-client";
import { RiskScoreEvent } from "@/utils/types/contract-types";
import { REGISTRY_ADDRESS } from "@/config/contracts";

export function RiskDashboard() {
  const [recentEvents, setRecentEvents] = useState<RiskScoreEvent[]>([]);

  useEffect(() => {
    let unsubscribe: () => void;

    async function setupListener() {
      const client = await createBrowserClient(REGISTRY_ADDRESS);

      // Listen to new risk scores in real-time
      unsubscribe = client.listenToScoreUpdates(
        (event) => {
          console.log("New risk score written:", event);
          setRecentEvents((prev) => [
            {
              targetContract: event.targetContract,
              riskScore: event.riskScore,
              writer: event.writer,
              timestamp: event.timestamp,
            },
            ...prev.slice(0, 9), // Keep last 10
          ]);
        }
      );
    }

    setupListener();
    return () => unsubscribe?.();
  }, []);

  return (
    <div className="space-y-4">
      <h2>Recent Risk Assessments</h2>
      {recentEvents.map((event) => (
        <div key={event.timestamp} className="p-4 border rounded">
          <code>{event.targetContract}</code>
          <p className="text-sm text-gray-500">{event.riskScore}</p>
        </div>
      ))}
    </div>
  );
}
\`\`\`

### Example 3: Batch Checking Multiple Contracts

Efficiently check multiple contracts at once:

\`\`\`typescript
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/utils/contract-integration/risk-registry-client";
import { RiskAssessment } from "@/utils/types/contract-types";
import { REGISTRY_ADDRESS } from "@/config/contracts";

export function ContractsList({ contracts }: { contracts: string[] }) {
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAll() {
      try {
        const client = await createBrowserClient(REGISTRY_ADDRESS);
        
        // Get all risks in one call
        const assessments = await client.getRiskScoreBatch(contracts);
        setRisks(assessments);
      } catch (error) {
        console.error("Failed to check contracts:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAll();
  }, [contracts]);

  if (loading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Contract Address</th>
          <th>Risk Level</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {risks.map((risk) => (
          <tr key={risk.address}>
            <td><code>{risk.address}</code></td>
            <td className={`badge badge-${risk.level}`}>{risk.level}</td>
            <td>{risk.score ? risk.score + "/100" : "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
\`\`\`

### Example 4: Display Risk Badge with Styling

Create a reusable risk indicator component:

\`\`\`typescript
"use client";

import { RiskLevel } from "@/utils/types/contract-types";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  const colors: Record<RiskLevel, string> = {
    SAFE: "bg-green-100 text-green-800",
    LOW_RISK: "bg-blue-100 text-blue-800",
    MEDIUM_RISK: "bg-yellow-100 text-yellow-800",
    HIGH_RISK: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800",
    UNKNOWN: "bg-gray-100 text-gray-800",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span className={`rounded-full font-semibold ${colors[level]} ${sizes[size]}`}>
      {level}
    </span>
  );
}
\`\`\`

## Configuration by Network

### Sepolia (Testnet)

\`\`\`env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x... # Your deployed address
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY
\`\`\`

### Ethereum Mainnet

\`\`\`env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x... # Your deployed address
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
\`\`\`

### Polygon

\`\`\`env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x... # Your deployed address
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
\`\`\`

## Troubleshooting

### "Web3 provider not found"

The user needs to install MetaMask or similar:

\`\`\`typescript
try {
  const client = await createBrowserClient(REGISTRY_ADDRESS);
} catch (error) {
  if (error.message.includes("Web3 provider")) {
    // Show prompt to install MetaMask
  }
}
\`\`\`

### "Contract address is not set"

Make sure \`NEXT_PUBLIC_REGISTRY_ADDRESS\` environment variable is set in \`.env.local\`

### "Transaction failed"

Check:
1. User has sufficient gas (for write operations)
2. User is an authorized writer (for writeRiskScore)
3. Network is correct (check chainId)

## Performance Tips

- Use \`getRiskScoreBatch\` instead of multiple \`getRiskScore\` calls
- Cache results using React Query or SWR
- Use event listeners for real-time updates instead of polling
- Consider indexing services like The Graph for large datasets
\`\`\`
