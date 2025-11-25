# Scathat Smart Contracts

## Overview

This directory contains the smart contracts for the Scathat risk assessment registry. These contracts form the on-chain backend for storing and managing security labels for smart contracts.

## Core Contract

### RiskRegistry.sol

The main contract that implements on-chain data labeling:

- **Purpose**: Stores immutable risk scores for smart contract addresses
- **Access Control**: Owner + authorized writers can publish/update scores
- **Public Reads**: Anyone can query risk scores
- **Use Cases**: Security scanners, AI engines, audit tools, risk systems

## Key Concepts

### Data Labeling System

Think of it like a public database where:
1. Trusted writers publish risk assessments (labels)
2. The blockchain makes these permanently verifiable
3. Anyone can query the current risk status
4. Only owner can correct/update existing labels

### Writer Authorization

Different services can be authorized to write scores:

\`\`\`typescript
// Example writers
const writers = {
  aiEngine: "0x123...", // Scathat AI scoring engine
  securityScanner: "0x456...", // Real-time security analysis
  auditBot: "0x789...", // Automated audit verification
};
\`\`\`

## File Structure

\`\`\`
contracts/
├── RiskRegistry.sol          # Main contract
├── interfaces/
│   └── IRiskRegistry.sol     # Contract interface
├── abi/
│   └── RiskRegistry.json     # Generated ABI
├── types/
│   └── index.ts              # TypeScript types
└── README.md                 # This file
\`\`\`

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 2. Compile Contracts

\`\`\`bash
npx hardhat compile
\`\`\`

### 3. Deploy to Network

\`\`\`bash
# Local testing
npx hardhat run scripts/deploy.ts --network localhost

# Ethereum Testnet (Sepolia)
npx hardhat run scripts/deploy.ts --network sepolia

# Polygon Mumbai
npx hardhat run scripts/deploy.ts --network mumbai
\`\`\`

### 4. Setup Writers

\`\`\`bash
# Update WRITERS_TO_AUTHORIZE in scripts/setup-writers.ts
REGISTRY_ADDRESS=0x... npx hardhat run scripts/setup-writers.ts
\`\`\`

## Common Operations

### Writing a Risk Score

\`\`\`typescript
// Only authorized writers or owner can do this
const tx = await registry.writeRiskScore(
  targetContractAddress,
  "SAFE" // or "HIGH_RISK", "score: 85", etc.
);
\`\`\`

### Reading a Risk Score

\`\`\`typescript
// Anyone can read publicly
const score = await registry.getRiskScore(targetContractAddress);
\`\`\`

### Updating a Score (Owner Only)

\`\`\`typescript
const tx = await registry.updateRiskScore(
  targetContractAddress,
  "MEDIUM_RISK"
);
\`\`\`

## Security Considerations

- **Immutability**: Scores cannot be overwritten by writers (prevents accidental overwrites)
- **Owner Controls**: Only owner can update existing scores or manage writers
- **Reentrancy Protection**: All state-changing functions protected with ReentrancyGuard
- **Input Validation**: Risk scores must be non-empty and under 256 characters

## Events

All operations emit events for off-chain tracking:

- `RiskScoreWritten` - New score published
- `RiskScoreUpdated` - Existing score modified
- `RiskScoreRemoved` - Score deleted
- `WriterAuthorized` - Writer permissions changed

## Testing

Run all tests:

\`\`\`bash
npx hardhat test
\`\`\`

Run manual integration test:

\`\`\`bash
npx hardhat run scripts/test-registry.ts --network localhost
\`\`\`

## Integration with Frontend

See the SDK documentation in `web/utils/contract-integration/` for how to interact with these contracts from the frontend.
