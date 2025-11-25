/**
 * Unit Tests for RiskRegistry Contract
 *
 * Comprehensive test suite covering:
 * - Writing and reading risk scores
 * - Access control (owner, writers, public)
 * - Score updates and deletion
 * - Writer authorization management
 * - Edge cases and error conditions
 */

import { expect } from "chai"
import { ethers } from "hardhat"
import type { RiskRegistry } from "../typechain-types"

describe("RiskRegistry", () => {
  let registry: RiskRegistry
  let owner: any
  let writer: any
  let unauthorized: any

  // Test contract address
  const TEST_CONTRACT = "0x" + "1".repeat(40)
  const SAFE_SCORE = "SAFE"
  const HIGH_RISK_SCORE = "HIGH_RISK"

  beforeEach(async () => {
    // Get signers for testing different roles
    ;[owner, writer, unauthorized] = await ethers.getSigners()

    // Deploy fresh contract for each test
    const RiskRegistry = await ethers.getContractFactory("RiskRegistry")
    registry = await RiskRegistry.deploy()
  })

  // ============ WRITE OPERATIONS TESTS ============

  describe("Writing Risk Scores", () => {
    it("Should allow owner to write a risk score", async () => {
      const tx = await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)
      await expect(tx).to.emit(registry, "RiskScoreWritten")

      const score = await registry.getRiskScore(TEST_CONTRACT)
      expect(score).to.equal(SAFE_SCORE)
    })

    it("Should allow authorized writer to write a risk score", async () => {
      // Authorize the writer
      await registry.authorizeWriter(writer.address)

      // Writer should be able to write
      const tx = await registry.connect(writer).writeRiskScore(TEST_CONTRACT, SAFE_SCORE)
      await expect(tx).to.emit(registry, "RiskScoreWritten")

      const score = await registry.getRiskScore(TEST_CONTRACT)
      expect(score).to.equal(SAFE_SCORE)
    })

    it("Should reject unauthorized addresses from writing", async () => {
      const tx = registry.connect(unauthorized).writeRiskScore(TEST_CONTRACT, SAFE_SCORE)
      await expect(tx).to.be.revertedWith("Only owner or authorized writers")
    })

    it("Should reject empty risk scores", async () => {
      const tx = registry.writeRiskScore(TEST_CONTRACT, "")
      await expect(tx).to.be.revertedWith("Risk score cannot be empty")
    })

    it("Should reject risk scores exceeding max length", async () => {
      const longScore = "x".repeat(257) // MAX_RISK_SCORE_LENGTH is 256
      const tx = registry.writeRiskScore(TEST_CONTRACT, longScore)
      await expect(tx).to.be.revertedWith("exceeds maximum length")
    })

    it("Should prevent overwriting existing scores", async () => {
      // Write first score
      await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)

      // Attempt to write another score to same contract
      const tx = registry.writeRiskScore(TEST_CONTRACT, HIGH_RISK_SCORE)
      await expect(tx).to.be.revertedWith("Score already exists")
    })
  })

  // ============ READ OPERATIONS TESTS ============

  describe("Reading Risk Scores", () => {
    it("Should return empty string for non-existent scores", async () => {
      const score = await registry.getRiskScore(TEST_CONTRACT)
      expect(score).to.equal("")
    })

    it("Should return the correct score when exists", async () => {
      await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)
      const score = await registry.getRiskScore(TEST_CONTRACT)
      expect(score).to.equal(SAFE_SCORE)
    })

    it("Should allow anyone to read scores", async () => {
      await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)

      // Unauthorized user should be able to read
      const score = await registry.connect(unauthorized).getRiskScore(TEST_CONTRACT)
      expect(score).to.equal(SAFE_SCORE)
    })

    it("hasRiskScore should return correct status", async () => {
      expect(await registry.hasRiskScore(TEST_CONTRACT)).to.be.false

      await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)

      expect(await registry.hasRiskScore(TEST_CONTRACT)).to.be.true
    })
  })

  // ============ UPDATE OPERATIONS TESTS ============

  describe("Updating Risk Scores", () => {
    it("Should allow owner to update existing score", async () => {
      // Write initial score
      await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)

      // Update score
      const tx = await registry.updateRiskScore(TEST_CONTRACT, HIGH_RISK_SCORE)
      await expect(tx).to.emit(registry, "RiskScoreUpdated")

      const score = await registry.getRiskScore(TEST_CONTRACT)
      expect(score).to.equal(HIGH_RISK_SCORE)
    })

    it("Should only allow owner to update", async () => {
      await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)

      const tx = registry.connect(writer).updateRiskScore(TEST_CONTRACT, HIGH_RISK_SCORE)
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should reject update for non-existent scores", async () => {
      const tx = registry.updateRiskScore(TEST_CONTRACT, HIGH_RISK_SCORE)
      await expect(tx).to.be.revertedWith("No score exists")
    })
  })

  // ============ DELETION OPERATIONS TESTS ============

  describe("Removing Risk Scores", () => {
    it("Should allow owner to remove score", async () => {
      await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)

      const tx = await registry.removeRiskScore(TEST_CONTRACT)
      await expect(tx).to.emit(registry, "RiskScoreRemoved")

      expect(await registry.hasRiskScore(TEST_CONTRACT)).to.be.false
    })

    it("Should only allow owner to remove", async () => {
      await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)

      const tx = registry.connect(writer).removeRiskScore(TEST_CONTRACT)
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should allow re-writing after removal", async () => {
      // Write and remove
      await registry.writeRiskScore(TEST_CONTRACT, SAFE_SCORE)
      await registry.removeRiskScore(TEST_CONTRACT)

      // Should be able to write again
      const tx = await registry.writeRiskScore(TEST_CONTRACT, HIGH_RISK_SCORE)
      await expect(tx).to.not.be.reverted

      const score = await registry.getRiskScore(TEST_CONTRACT)
      expect(score).to.equal(HIGH_RISK_SCORE)
    })
  })

  // ============ WRITER MANAGEMENT TESTS ============

  describe("Writer Authorization", () => {
    it("Should authorize new writer", async () => {
      const tx = await registry.authorizeWriter(writer.address)
      await expect(tx).to.emit(registry, "WriterAuthorized")

      expect(await registry.isWriterAuthorized(writer.address)).to.be.true
    })

    it("Should reject duplicate authorization", async () => {
      await registry.authorizeWriter(writer.address)

      const tx = registry.authorizeWriter(writer.address)
      await expect(tx).to.be.revertedWith("already authorized")
    })

    it("Should revoke writer permissions", async () => {
      await registry.authorizeWriter(writer.address)

      const tx = await registry.revokeWriter(writer.address)
      await expect(tx).to.emit(registry, "WriterAuthorized")

      expect(await registry.isWriterAuthorized(writer.address)).to.be.false
    })

    it("Should only allow owner to manage writers", async () => {
      const tx = registry.connect(writer).authorizeWriter(unauthorized.address)
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  // ============ EDGE CASES ============

  describe("Edge Cases", () => {
    it("Should handle multiple different contracts", async () => {
      const contract1 = "0x" + "1".repeat(40)
      const contract2 = "0x" + "2".repeat(40)

      await registry.writeRiskScore(contract1, "SAFE")
      await registry.writeRiskScore(contract2, "HIGH_RISK")

      expect(await registry.getRiskScore(contract1)).to.equal("SAFE")
      expect(await registry.getRiskScore(contract2)).to.equal("HIGH_RISK")
    })

    it("Should handle maximum length scores", async () => {
      const maxScore = "x".repeat(256) // MAX_RISK_SCORE_LENGTH

      const tx = await registry.writeRiskScore(TEST_CONTRACT, maxScore)
      await expect(tx).to.not.be.reverted

      const score = await registry.getRiskScore(TEST_CONTRACT)
      expect(score).to.equal(maxScore)
    })

    it("Should handle special characters in scores", async () => {
      const specialScore = 'score: 85/100 | "SAFE" & HIGH_RISK!'

      const tx = await registry.writeRiskScore(TEST_CONTRACT, specialScore)
      await expect(tx).to.not.be.reverted

      const score = await registry.getRiskScore(TEST_CONTRACT)
      expect(score).to.equal(specialScore)
    })
  })
})
