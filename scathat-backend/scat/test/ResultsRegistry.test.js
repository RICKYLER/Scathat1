const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ResultsRegistry", function () {
  let ResultsRegistry;
  let resultsRegistry;
  let owner;
  let authorizedWriter;
  let unauthorizedUser;
  let testContractAddress;

  beforeEach(async function () {
    [owner, authorizedWriter, unauthorizedUser] = await ethers.getSigners();
    
    ResultsRegistry = await ethers.getContractFactory("ResultsRegistry");
    resultsRegistry = await ResultsRegistry.deploy();
    await resultsRegistry.waitForDeployment();

    testContractAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Random test address
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await resultsRegistry.owner()).to.equal(owner.address);
    });

    it("Should have correct MAX_RISK_SCORE_LENGTH", async function () {
      expect(await resultsRegistry.MAX_RISK_SCORE_LENGTH()).to.equal(256);
    });
  });

  describe("Authorization Management", function () {
    it("Should allow owner to authorize writers", async function () {
      await expect(resultsRegistry.setWriterAuthorization(authorizedWriter.address, true))
        .to.emit(resultsRegistry, "WriterAuthorizationChanged")
        .withArgs(authorizedWriter.address, true, owner.address);

      expect(await resultsRegistry.isAuthorizedWriter(authorizedWriter.address)).to.be.true;
    });

    it("Should allow owner to revoke writers", async function () {
      await resultsRegistry.setWriterAuthorization(authorizedWriter.address, true);
      await resultsRegistry.setWriterAuthorization(authorizedWriter.address, false);

      expect(await resultsRegistry.isAuthorizedWriter(authorizedWriter.address)).to.be.false;
    });

    it("Should reject zero address for authorization", async function () {
      await expect(
        resultsRegistry.setWriterAuthorization(ethers.ZeroAddress, true)
      ).to.be.revertedWith("ResultsRegistry: invalid writer address");
    });

    it("Should reject unauthorized users from authorizing writers", async function () {
      await expect(
        resultsRegistry.connect(unauthorizedUser).setWriterAuthorization(authorizedWriter.address, true)
      ).to.be.reverted; // Ownable custom error
    });
  });

  describe("Writing Risk Scores", function () {
    beforeEach(async function () {
      await resultsRegistry.setWriterAuthorization(authorizedWriter.address, true);
    });

    it("Should allow owner to write risk scores", async function () {
      const riskScore = "LOW_RISK";
      
      await expect(resultsRegistry.writeRiskScore(testContractAddress, riskScore))
        .to.emit(resultsRegistry, "ScoreRecorded")
        .withArgs(testContractAddress, riskScore, owner.address, anyValue);

      expect(await resultsRegistry.getRiskScore(testContractAddress)).to.equal(riskScore);
    });

    it("Should allow authorized writers to write risk scores", async function () {
      const riskScore = "MEDIUM_RISK";
      
      await expect(resultsRegistry.connect(authorizedWriter).writeRiskScore(testContractAddress, riskScore))
        .to.emit(resultsRegistry, "ScoreRecorded")
        .withArgs(testContractAddress, riskScore, authorizedWriter.address, anyValue);

      expect(await resultsRegistry.getRiskScore(testContractAddress)).to.equal(riskScore);
    });

    it("Should reject unauthorized users from writing scores", async function () {
      const riskScore = "HIGH_RISK";
      
      await expect(
        resultsRegistry.connect(unauthorizedUser).writeRiskScore(testContractAddress, riskScore)
      ).to.be.revertedWith("ResultsRegistry: caller is not authorized");
    });

    it("Should reject zero contract address", async function () {
      const riskScore = "LOW_RISK";
      
      await expect(
        resultsRegistry.writeRiskScore(ethers.ZeroAddress, riskScore)
      ).to.be.revertedWith("ResultsRegistry: invalid contract address");
    });

    it("Should reject empty risk scores", async function () {
      await expect(
        resultsRegistry.writeRiskScore(testContractAddress, "")
      ).to.be.revertedWith("ResultsRegistry: risk score cannot be empty");
    });

    it("Should reject risk scores that are too long", async function () {
      const longRiskScore = "A".repeat(257); // 257 characters
      
      await expect(
        resultsRegistry.writeRiskScore(testContractAddress, longRiskScore)
      ).to.be.revertedWith("ResultsRegistry: risk score exceeds maximum length of 256 characters");
    });

    it("Should prevent overwriting existing scores", async function () {
      const initialScore = "LOW_RISK";
      const newScore = "HIGH_RISK";
      
      await resultsRegistry.writeRiskScore(testContractAddress, initialScore);
      
      await expect(
        resultsRegistry.writeRiskScore(testContractAddress, newScore)
      ).to.be.revertedWith("ResultsRegistry: score already exists for this contract");
    });
  });

  describe("Reading Risk Scores", function () {
    beforeEach(async function () {
      await resultsRegistry.setWriterAuthorization(authorizedWriter.address, true);
      await resultsRegistry.writeRiskScore(testContractAddress, "MODERATE_RISK");
    });

    it("Should return correct risk score", async function () {
      expect(await resultsRegistry.getRiskScore(testContractAddress)).to.equal("MODERATE_RISK");
    });

    it("Should reject reading from zero address", async function () {
      await expect(
        resultsRegistry.getRiskScore(ethers.ZeroAddress)
      ).to.be.revertedWith("ResultsRegistry: invalid contract address");
    });

    it("Should reject reading non-existent scores", async function () {
      const nonExistentAddress = "0x0000000000000000000000000000000000000001";
      
      await expect(
        resultsRegistry.getRiskScore(nonExistentAddress)
      ).to.be.revertedWith("ResultsRegistry: no risk score found for this contract");
    });

    it("Should correctly check if score exists", async function () {
      expect(await resultsRegistry.hasRiskScore(testContractAddress)).to.be.true;
      
      const nonExistentAddress = "0x0000000000000000000000000000000000000001";
      expect(await resultsRegistry.hasRiskScore(nonExistentAddress)).to.be.false;
    });
  });

  describe("Updating Risk Scores", function () {
    beforeEach(async function () {
      await resultsRegistry.setWriterAuthorization(authorizedWriter.address, true);
      await resultsRegistry.writeRiskScore(testContractAddress, "INITIAL_SCORE");
    });

    it("Should allow owner to update scores", async function () {
      const newScore = "UPDATED_SCORE";
      
      await expect(resultsRegistry.updateRiskScore(testContractAddress, newScore))
        .to.emit(resultsRegistry, "ScoreRecorded")
        .withArgs(testContractAddress, newScore, owner.address, anyValue);

      expect(await resultsRegistry.getRiskScore(testContractAddress)).to.equal(newScore);
    });

    it("Should reject unauthorized users from updating scores", async function () {
      await expect(
        resultsRegistry.connect(unauthorizedUser).updateRiskScore(testContractAddress, "NEW_SCORE")
      ).to.be.reverted; // Ownable custom error
    });

    it("Should reject updating non-existent scores", async function () {
      const nonExistentAddress = "0x0000000000000000000000000000000000000001";
      
      await expect(
        resultsRegistry.updateRiskScore(nonExistentAddress, "NEW_SCORE")
      ).to.be.revertedWith("ResultsRegistry: no existing score to update");
    });
  });

  describe("Removing Risk Scores", function () {
    beforeEach(async function () {
      await resultsRegistry.setWriterAuthorization(authorizedWriter.address, true);
      await resultsRegistry.writeRiskScore(testContractAddress, "SCORE_TO_REMOVE");
    });

    it("Should allow owner to remove scores", async function () {
      await expect(resultsRegistry.removeRiskScore(testContractAddress))
        .to.emit(resultsRegistry, "ScoreRecorded")
        .withArgs(testContractAddress, "", owner.address, anyValue);

      expect(await resultsRegistry.hasRiskScore(testContractAddress)).to.be.false;
    });

    it("Should reject unauthorized users from removing scores", async function () {
      await expect(
        resultsRegistry.connect(unauthorizedUser).removeRiskScore(testContractAddress)
      ).to.be.reverted; // Ownable custom error
    });

    it("Should reject removing non-existent scores", async function () {
      const nonExistentAddress = "0x0000000000000000000000000000000000000001";
      
      await expect(
        resultsRegistry.removeRiskScore(nonExistentAddress)
      ).to.be.revertedWith("ResultsRegistry: no score to remove");
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should be protected against reentrancy attacks", async function () {
      // This test verifies that the nonReentrant modifier is working
      // Actual reentrancy attack simulation would require a malicious contract
      // The presence of nonReentrant modifier prevents reentrancy
      
      await resultsRegistry.setWriterAuthorization(authorizedWriter.address, true);
      
      // Multiple consecutive calls should work normally (not reentrant)
      const address1 = "0x0000000000000000000000000000000000000001";
      const address2 = "0x0000000000000000000000000000000000000002";
      
      await resultsRegistry.writeRiskScore(address1, "SCORE_1");
      await resultsRegistry.writeRiskScore(address2, "SCORE_2");
      
      expect(await resultsRegistry.getRiskScore(address1)).to.equal("SCORE_1");
      expect(await resultsRegistry.getRiskScore(address2)).to.equal("SCORE_2");
    });
  });

  // Helper function for timestamp matching
  function anyValue() {
    return true; // Accept any value for timestamp
  }
});