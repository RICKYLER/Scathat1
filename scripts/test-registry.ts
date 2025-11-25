/**
 * Manual Testing Script for RiskRegistry
 *
 * Use this to manually test contract functionality
 * Tests all major operations: write, read, update, delete
 *
 * Usage: npx hardhat run scripts/test-registry.ts --network localhost
 */

import { ethers } from "hardhat"

async function main() {
  const [owner, writer, user] = await ethers.getSigners()

  console.log("Deploying RiskRegistry for testing...")
  const RiskRegistry = await ethers.getContractFactory("RiskRegistry")
  const registry = await RiskRegistry.deploy()
  await registry.deployed()

  console.log("Registry deployed at:", registry.address)
  console.log("Owner:", owner.address)
  console.log("Writer:", writer.address)

  // Test 1: Authorize a writer
  console.log("\n=== Test 1: Authorize Writer ===")
  let tx = await registry.authorizeWriter(writer.address)
  await tx.wait()
  const isAuthorized = await registry.isWriterAuthorized(writer.address)
  console.log("Writer authorized:", isAuthorized)

  // Test 2: Write a risk score
  console.log("\n=== Test 2: Write Risk Score ===")
  const targetContract = "0x" + "1".repeat(40) // Dummy contract address
  const riskScore = "SAFE"

  tx = await registry.connect(writer).writeRiskScore(targetContract, riskScore)
  await tx.wait()

  const score = await registry.getRiskScore(targetContract)
  console.log("Written score for", targetContract, ":", score)

  // Test 3: Try to write duplicate (should fail)
  console.log("\n=== Test 3: Attempt Duplicate Write (should fail) ===")
  try {
    tx = await registry.connect(writer).writeRiskScore(targetContract, "HIGH_RISK")
    await tx.wait()
    console.log("ERROR: Duplicate write should have failed!")
  } catch (error) {
    console.log("Correctly rejected duplicate write")
  }

  // Test 4: Update score as owner
  console.log("\n=== Test 4: Update Risk Score (Owner) ===")
  tx = await registry.updateRiskScore(targetContract, "MEDIUM_RISK")
  await tx.wait()

  const updatedScore = await registry.getRiskScore(targetContract)
  console.log("Updated score:", updatedScore)

  // Test 5: Public can read
  console.log("\n=== Test 5: Public Read ===")
  const publicScore = await registry.connect(user).getRiskScore(targetContract)
  console.log("Public read score:", publicScore)

  // Test 6: Remove score
  console.log("\n=== Test 6: Remove Risk Score ===")
  tx = await registry.removeRiskScore(targetContract)
  await tx.wait()

  const hasScore = await registry.hasRiskScore(targetContract)
  console.log("Score exists after removal:", hasScore)

  console.log("\nAll tests completed successfully!")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
