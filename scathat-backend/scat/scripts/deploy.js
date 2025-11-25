const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting ResultsRegistry deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying contract with account: ${deployer.address}`);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    throw new Error("❌ Insufficient balance for deployment");
  }

  // Deploy the contract
  console.log("📦 Deploying ResultsRegistry...");
  const ResultsRegistry = await ethers.getContractFactory("ResultsRegistry");
  const resultsRegistry = await ResultsRegistry.deploy();

  console.log("⏳ Waiting for deployment confirmation...");
  await resultsRegistry.waitForDeployment();

  const contractAddress = await resultsRegistry.getAddress();
  console.log(`✅ ResultsRegistry deployed to: ${contractAddress}`);

  // Get contract info
  const txReceipt = await ethers.provider.getTransactionReceipt(resultsRegistry.deploymentTransaction().hash);
  console.log(`📊 Gas used: ${txReceipt.gasUsed.toString()}`);
  console.log(`🔗 Transaction hash: ${resultsRegistry.deploymentTransaction().hash}`);

  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    transactionHash: resultsRegistry.deploymentTransaction().hash,
    gasUsed: txReceipt.gasUsed.toString(),
    timestamp: new Date().toISOString(),
    abi: ResultsRegistry.interface.formatJson()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `deployment-${network.name}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}`);

  // Generate environment file snippet
  const envSnippet = `
# ResultsRegistry Contract Configuration
RESULTS_REGISTRY_ADDRESS="${contractAddress}"
RESULTS_REGISTRY_ABI='${JSON.stringify(JSON.parse(deploymentInfo.abi))}'
DEPLOYER_PRIVATE_KEY="<your-deployer-private-key>"
  `;

  console.log("\n📋 Add these to your .env file:");
  console.log(envSnippet);

  // Verify contract on Etherscan (if configured)
  if (network.config.verify && network.config.verify.etherscan) {
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      // Wait for block confirmation
      await resultsRegistry.deploymentTransaction().wait(5);
      
      // Run verification
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.warn("⚠️  Contract verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log(`📜 Contract ABI length: ${deploymentInfo.abi.length} characters`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });