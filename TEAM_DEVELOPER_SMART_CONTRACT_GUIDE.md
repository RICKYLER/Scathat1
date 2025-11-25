# Smart Contract Development Guide for Team

This guide helps team members understand, deploy, and work with the RiskRegistry smart contracts.

## Quick Start (5 minutes)

### 1. Install Hardhat

\`\`\`bash
npm install --save-dev hardhat
npx hardhat
# Choose "Create a basic sample project"
\`\`\`

### 2. Copy Contract Files

Place the following into your Hardhat project:

\`\`\`
contracts/
├── RiskRegistry.sol
├── interfaces/
│   └── IRiskRegistry.sol
├── test/
│   └── RiskRegistry.test.ts
└── README.md
\`\`\`

### 3. Compile and Test

\`\`\`bash
# Compile contracts
npx hardhat compile

# Run all tests
npx hardhat test

# Expected output: All tests passing
\`\`\`

## Understanding RiskRegistry

### What It Does

It's an on-chain database for contract risk scores:

\`\`\`
Contract Address → Risk Score
─────────────────────────────
0x123...abc  →  "SAFE"
0x456...def  →  "HIGH_RISK"
0x789...ghi  →  "MEDIUM_RISK_REENTRANCY"
\`\`\`

### Key Roles

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **Owner** | Everything - write, update, delete, authorize writers | Deploy again |
| **Writer** | Write new scores (one per contract) | Update or delete |
| **Public** | Read any score | Write anything |

### Three Main Operations

#### 1. WRITE (Anyone Can Read)

Owner or authorized writer publishes a new risk assessment:

\`\`\`typescript
// Authorize a writer first
await registry.authorizeWriter("0xAI_BOT_ADDRESS");

// Then writer can publish scores
await registry.connect(aiBot).writeRiskScore(
  "0xContractAddress",
  "SAFE"
);
\`\`\`

#### 2. UPDATE (Owner Only)

Fix or update an existing score:

\`\`\`typescript
await registry.updateRiskScore(
  "0xContractAddress",
  "HIGH_RISK" // Was "SAFE", now updated
);
\`\`\`

#### 3. READ (Everyone Can Do)

Anyone queries the current risk status:

\`\`\`typescript
const score = await registry.getRiskScore("0xContractAddress");
console.log(score); // "HIGH_RISK"
\`\`\`

## Common Tasks

### Task 1: Deploy to Local Network

\`\`\`bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy.ts --network localhost

# Output will show deployment address
\`\`\`

### Task 2: Deploy to Testnet

\`\`\`bash
# 1. Update .env with Sepolia RPC URL
SEPOLIA_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY

# 2. Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# 3. Save the contract address
REGISTRY_ADDRESS=0x1234...
\`\`\`

### Task 3: Authorize AI Bot to Write Scores

\`\`\`bash
# 1. Update scripts/setup-writers.ts
const WRITERS_TO_AUTHORIZE = [
  "0x...AI_BOT_ADDRESS...",
];

# 2. Run setup
REGISTRY_ADDRESS=0x1234... npx hardhat run scripts/setup-writers.ts --network sepolia
\`\`\`

### Task 4: Manually Test Everything

\`\`\`bash
# This script does write → read → update → delete testing
npx hardhat run scripts/test-registry.ts --network localhost
\`\`\`

## How to Integrate with Frontend

### Step 1: Get Contract Address

After deployment, note the address:

\`\`\`
RiskRegistry deployed to: 0x1234567890123456789012345678901234567890
\`\`\`

### Step 2: Export ABI

The ABI is pre-generated in `contracts/abi/RiskRegistry.json`

### Step 3: Create Frontend Integration (Next.js)

See `web/utils/contract-integration/risk-registry-client.ts` for the full client.

Quick example:

\`\`\`typescript
import { ethers } from "ethers";
import REGISTRY_ABI from "@/contracts/abi/RiskRegistry.json";

const REGISTRY_ADDRESS = "0x1234...";

async function getRiskScore(contractAddress: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(
    REGISTRY_ADDRESS,
    REGISTRY_ABI,
    provider
  );
  
  const score = await contract.getRiskScore(contractAddress);
  return score || "NO_DATA";
}
\`\`\`

## Troubleshooting

### "Contract address is not set"

**Problem**: You forgot to set REGISTRY_ADDRESS environment variable

**Solution**:
\`\`\`bash
export REGISTRY_ADDRESS=0x1234...
\`\`\`

### "Failed to authorize writer"

**Problem**: Called with invalid address or network mismatch

**Solution**:
- Verify the writer address is valid (40 hex chars after 0x)
- Confirm you're using the right network
- Check the address is not already authorized

### "Score already exists"

**Problem**: Tried to write a second score to same contract

**Solution**: Use `updateRiskScore` instead (owner only) or delete with `removeRiskScore`

## Gas Optimization Tips

Gas costs for each operation (approximate):

- **writeRiskScore**: 70,000-90,000 gas
- **updateRiskScore**: 60,000-80,000 gas
- **removeRiskScore**: 40,000-60,000 gas
- **authorizeWriter**: 50,000-70,000 gas
- **getRiskScore**: 0 gas (read-only, no fee)

Lower gas on Layer 2 networks (Polygon, Arbitrum, Optimism).

## Security Best Practices

1. **Private Keys**: Never commit `.env` with real private keys
2. **Multiple Signatures**: For mainnet, use MultiSig wallet for owner
3. **Emergency Pause**: Consider adding pause functionality for mainnet
4. **Writer Rotation**: Regularly audit and rotate authorized writers
5. **Score Updates**: Have approval process before updating scores

## Resources

- [Solidity Docs](https://docs.soliditylang.org/)
- [Hardhat Docs](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethers.js Docs](https://docs.ethers.org/)
\`\`\`
