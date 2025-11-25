/**
 * Deployment Script for RiskRegistry Contract
 *
 * This script handles the deployment of the RiskRegistry contract
 * across different networks (mainnet, testnet, etc.)
 *
 * Usage:
 * npx hardhat run scripts/deploy.ts --network <network-name>
 */

import { ethers } from "hardhat"

async function main() {
  console.log("Deploying RiskRegistry contract...")

  // Get the contract factory
  const RiskRegistry = await ethers.getContractFactory("RiskRegistry")

  // Deploy the contract
  // Constructor takes no arguments - deployer becomes owner
  const contract = await RiskRegistry.deploy()

  // Wait for deployment to complete
  await contract.deployed()

  console.log("RiskRegistry deployed to:", contract.address)

  // Save deployment info to file
  const deploymentInfo = {
    contractAddress: contract.address,
    deploymentBlock: await ethers.provider.getBlockNumber(),
    deployer: (await ethers.getSigners())[0].address,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString(),
  }

  console.log("Deployment Info:", deploymentInfo)

  return deploymentInfo
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
