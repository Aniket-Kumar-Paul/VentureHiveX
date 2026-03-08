const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts to network:", hre.network.name);
  console.log("Deploying contracts with the account:", deployer.address);

  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const campaignFactory = await CampaignFactory.deploy();

  await campaignFactory.waitForDeployment();
  const address = await campaignFactory.getAddress();

  console.log("CampaignFactory deployed to:", address);

  // Wait for 2 block confirmations on live networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    const txReceipt = await campaignFactory.deploymentTransaction().wait(2);
    console.log(`Confirmed in block: ${txReceipt.blockNumber}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
