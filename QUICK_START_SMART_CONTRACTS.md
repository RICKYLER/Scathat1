# Quick Start: Smart Contracts (5 Minutes)

Get the Scathat smart contract backend running in 5 minutes.

## Step 1: Setup (2 min)

\`\`\`bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with your settings
DEPLOYER_PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://...
\`\`\`

## Step 2: Compile & Test (2 min)

\`\`\`bash
# Compile contracts
npx hardhat compile

# Run all tests (should pass)
npx hardhat test
\`\`\`

## Step 3: Deploy (1 min)

\`\`\`bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Output:
# RiskRegistry deployed to: 0x1234567890123456789012345678901234567890

# Save this address! You'll need it for frontend integration.
\`\`\`

## Step 4: Configure Frontend

Update `web/.env.local`:

\`\`\`env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY
\`\`\`

## Step 5: Use in Frontend

\`\`\`typescript
import { useRiskScore } from "@/hooks/use-risk-registry";

export function MyComponent() {
  const { risk, loading } = useRiskScore("0x123...");
  
  if (loading) return <div>Loading...</div>;
  
  return <div>Risk Level: {risk?.level}</div>;
}
\`\`\`

Done! You now have a fully functional on-chain risk registry.

## Next Steps

- Authorize your AI bot to write scores: `npx hardhat run scripts/setup-writers.ts`
- Test the entire flow
- Deploy to mainnet when ready

## Troubleshooting

**Compilation errors?**
\`\`\`bash
npx hardhat clean
npm install
npx hardhat compile
\`\`\`

**Test failures?**
Check that all dependencies are installed and you're using Node.js 16+

**Deployment failed?**
- Ensure you have ETH on Sepolia (use faucet)
- Check RPC URL is correct
- Verify private key has leading 0x

Still stuck? See TEAM_DEVELOPER_SMART_CONTRACT_GUIDE.md for detailed help.
