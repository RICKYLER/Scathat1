# Smart Contract Backend Architecture

Complete guide to the Scathat smart contract system architecture, organization, and integration.

## System Overview

\`\`\`
Scathat Smart Contract Backend
├── On-Chain Layer (RiskRegistry Contract)
│   ├── Data Storage (Mapping: Contract Address → Risk Score)
│   ├── Access Control (Owner + Authorized Writers)
│   └── Event System (Score Written/Updated/Removed)
│
├── Deployment Layer (Hardhat)
│   ├── Deploy Scripts
│   ├── Setup Scripts
│   └── Test Scripts
│
└── Integration Layer (Frontend SDK)
    ├── RiskRegistryClient (TypeScript)
    ├── Type Definitions
    └── Helper Functions
\`\`\`

## File Organization

### Smart Contracts Directory

\`\`\`
contracts/
│
├── RiskRegistry.sol              # Main contract (on-chain data labeling)
├── interfaces/
│   └── IRiskRegistry.sol         # Contract interface/ABI
│
├── test/
│   └── RiskRegistry.test.ts      # Comprehensive test suite (40+ tests)
│
├── abi/
│   └── RiskRegistry.json         # Generated ABI for frontend integration
│
├── types/
│   └── index.ts                  # TypeScript type definitions
│
└── README.md                      # Contract documentation
\`\`\`

### Deployment & Configuration

\`\`\`
scripts/
│
├── deploy.ts                     # Main deployment script
├── setup-writers.ts              # Authorize writers to contract
└── test-registry.ts              # Manual testing script
\`\`\`

### Frontend Integration

\`\`\`
web/utils/
│
├── contract-integration/
│   └── risk-registry-client.ts   # TypeScript SDK client
│
└── types/
    └── contract-types.ts         # Frontend type definitions
\`\`\`

## How It Works

### 1. Write Flow (Publishing Risk Scores)

\`\`\`
AI Engine / Security Scanner
    ↓
    Calls: writeRiskScore(contractAddress, "SAFE")
    ↓
    Smart Contract Validates:
    - Only owner or authorized writer?
    - Is score valid?
    - Does score already exist? (prevent overwrite)
    ↓
    Store on Blockchain
    ↓
    Emit Event: RiskScoreWritten
    ↓
    Public Can Now Read This Score
\`\`\`

### 2. Read Flow (Checking Risk Status)

\`\`\`
Frontend / User / dApp
    ↓
    Calls: getRiskScore(contractAddress)
    ↓
    Smart Contract Returns Risk Score
    ↓
    No Gas Fee (Read-Only)
    ↓
    Display Results to User
\`\`\`

### 3. Update Flow (Correcting Scores)

\`\`\`
Contract Owner
    ↓
    Calls: updateRiskScore(contractAddress, "HIGH_RISK")
    ↓
    Smart Contract Validates:
    - Only owner can do this
    - Score must exist
    ↓
    Update on Blockchain
    ↓
    Emit Event: RiskScoreUpdated
\`\`\`

## Key Components Explained

### RiskRegistry.sol

The main smart contract with:

- **State Variables**: Maps contract addresses to risk scores
- **Write Functions**: writeRiskScore, updateRiskScore, removeRiskScore
- **Read Functions**: getRiskScore, hasRiskScore, isWriterAuthorized
- **Management**: authorizeWriter, revokeWriter
- **Events**: RiskScoreWritten, RiskScoreUpdated, RiskScoreRemoved

### RiskRegistryClient (Frontend SDK)

TypeScript class providing:

- **Read Methods**: getRiskScore, getRiskScoreBatch, hasRiskScore
- **Write Methods**: writeRiskScore, updateRiskScore, removeRiskScore
- **Management**: authorizeWriter, revokeWriter
- **Monitoring**: listenToScoreUpdates (real-time events)
- **Utilities**: getContractInfo, parseRiskScore

### Test Suite

40+ comprehensive tests covering:

- Writing and reading scores
- Access control validation
- Score updates and deletion
- Writer authorization
- Edge cases and error handling
- Multiple contracts
- Maximum lengths and special characters

## Deployment Checklist

- [ ] Compile contracts: `npx hardhat compile`
- [ ] Run tests: `npx hardhat test`
- [ ] Deploy to testnet: `npx hardhat run scripts/deploy.ts --network sepolia`
- [ ] Save contract address from output
- [ ] Update `.env.local` with contract address
- [ ] Run setup script for authorized writers
- [ ] Verify contract on block explorer
- [ ] Update frontend configuration
- [ ] Test frontend integration

## Security Features

1. **Ownable** - Only owner can manage writers and update scores
2. **ReentrancyGuard** - Protects against reentrancy attacks
3. **Input Validation** - Score length and format checking
4. **Immutability** - Scores cannot be overwritten by writers
5. **Event Logging** - All changes are traceable

## Gas Optimization

Approximate gas costs:

- writeRiskScore: 70,000-90,000
- updateRiskScore: 60,000-80,000
- removeRiskScore: 40,000-60,000
- getRiskScore: 0 (read-only)

Consider Layer 2 networks for lower costs.

## Integration Flow

1. Deploy contract to blockchain
2. Add contract address to environment variables
3. Import RiskRegistryClient in frontend
4. Use client to read/write risk scores
5. Display results to users

## Next Steps

- Deploy to Ethereum Sepolia testnet
- Set up authorized writers (AI bot, scanner service)
- Integrate with frontend dashboard
- Test end-to-end workflow
- Move to production network (mainnet or Layer 2)
