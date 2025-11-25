/**
 * Setup Script for Authorizing Writers
 *
 * This script authorizes specific addresses as writers to the registry.
 * Useful for setting up AI bots, backend services, or authorized verifiers.
 *
 * Configuration: Update WRITERS_TO_AUTHORIZE before running
 */

import { ethers } from "hardhat"

// Configuration: Add writer addresses here
const WRITERS_TO_AUTHORIZE = [
  // Example: "0x1234...abcd", // AI Bot
  // Example: "0x5678...efgh", // Backend Service
]

const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS || ""

async function main() {
  if (!REGISTRY_ADDRESS) {
    throw new Error("REGISTRY_ADDRESS environment variable not set")
  }

  console.log("Authorizing writers for RiskRegistry at:", REGISTRY_ADDRESS)

  // Connect to the contract
  const RiskRegistry = await ethers.getContractAt("RiskRegistry", REGISTRY_ADDRESS)

  // Authorize each writer
  for (const writer of WRITERS_TO_AUTHORIZE) {
    try {
      console.log("Authorizing writer:", writer)

      const tx = await RiskRegistry.authorizeWriter(writer)
      await tx.wait()

      console.log("Successfully authorized:", writer)
    } catch (error) {
      console.error("Failed to authorize:", writer, error)
    }
  }

  console.log("Writer setup complete")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
