# Smart Contract Deployment Guide

## Pre-Deployment Checklist

- [ ] Compile contracts: `npx hardhat compile`
- [ ] Run tests: `npx hardhat test`
- [ ] Set up environment variables (see below)
- [ ] Verify contract code is production-ready
- [ ] Plan which addresses will be authorized writers

## Environment Variables

Create a `.env` file with:

\`\`\`env
# Private key of deployer account (has funds to pay gas)
DEPLOYER_PRIVATE_KEY=0x...

# RPC URLs for different networks
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Etherscan API for verification
ETHERSCAN_API_KEY=YOUR_KEY
\`\`\`

## Deployment Steps

### 1. Deploy RiskRegistry

\`\`\`bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Output will show:
# RiskRegistry deployed to: 0x1234...
\`\`\`

### 2. Save Contract Address

Save the contract address from output. You'll need it for:
- Writer setup
- Frontend integration
- Block explorer verification

### 3. Authorize Writers

Update `scripts/setup-writers.ts`:

\`\`\`typescript
const WRITERS_TO_AUTHORIZE = [
  "0x1234...", // Your AI Engine address
  "0x5678...", // Your Scanner Service address
];

const REGISTRY_ADDRESS = "0x9abc..."; // From step 1
\`\`\`

Run setup:

\`\`\`bash
npx hardhat run scripts/setup-writers.ts --network sepolia
\`\`\`

### 4. Verify Contract on Block Explorer

\`\`\`bash
npx hardhat verify --network sepolia 0x1234...
\`\`\`

## Network-Specific Configurations

### Ethereum Mainnet

Use for production. Requires:
- Real ETH for gas fees
- Careful testing on testnet first
- Multiple signature scheme recommended

### Ethereum Sepolia (Testnet)

Perfect for testing before mainnet:
- Free Sepolia ETH from faucets
- Same code as mainnet
- Good for final validation

### Polygon / Mumbai

Lower gas fees alternative:
- Mumbai for testing
- Mainnet for production

## After Deployment

### Update Frontend Configuration

In `web/config/contracts.ts`:

\`\`\`typescript
export const REGISTRY_ADDRESS = "0x1234..."; // Update this
export const REGISTRY_ABI = RiskRegistryABI;
\`\`\`

### Update Documentation

- [ ] Document contract address
- [ ] Document authorized writers
- [ ] Create setup guide for new team members
- [ ] Add contract address to README

## Troubleshooting

**"Insufficient funds"** - Ensure deployer account has enough ETH for gas

**"Contract already deployed"** - Use existing contract address instead

**"Compilation error"** - Run `npx hardhat compile` to debug

**"RPC error"** - Verify RPC URL and that network is accessible
