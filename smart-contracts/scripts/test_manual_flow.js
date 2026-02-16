const hre = require("hardhat");

async function main() {
  const [deployer, creator, investor1, investor2] = await hre.ethers.getSigners();
  
  console.log("--- Starting Manual Testing Flow ---");
  console.log("Deployer:", deployer.address);
  console.log("Creator:", creator.address);
  console.log("Investor1:", investor1.address);

  // 1. Deploy Factory
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const factory = await CampaignFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("\n[1] Factory Deployed at:", factoryAddress);

  // 2. Create Campaign
  const goalAmount = hre.ethers.parseEther("10"); // 10 ETH goal
  const totalTokenSupply = hre.ethers.parseEther("10000"); // 10,000 Tokens
  
  const currentBlock = await hre.ethers.provider.getBlock("latest");
  const startTime = currentBlock.timestamp + 60; // Start in 1 minute
  const endTime = startTime + 3600; // End in 1 hour

  console.log("\n[2] Creating Campaign...");
  console.log("Goal:", hre.ethers.formatEther(goalAmount), "ETH");
  console.log("Start Time:", new Date(startTime * 1000).toLocaleString());
  console.log("End Time:", new Date(endTime * 1000).toLocaleString());

  const createTx = await factory.connect(creator).createCampaign(
    goalAmount,
    startTime,
    endTime,
    totalTokenSupply,
    "VentureToken",
    "VTK",
    "ipfs://test-metadata-cid"
  );
  
  const receipt = await createTx.wait();
  // Find CampaignCreated event
  const event = receipt.logs.find(log => {
      // Create an interface to parse the logs if needed, but for simple finding in manual test:
      // We can try parsing with the contract interface
      try {
          const parsed = factory.interface.parseLog(log);
          return parsed.name === 'CampaignCreated';
      } catch (e) { return false; }
  });

  const parsedEvent = factory.interface.parseLog(event);
  const campaignId = parsedEvent.args[0];
  console.log("Campaign Created with ID:", campaignId.toString());

  // 3. Check Details
  const campaign = await factory.getCampaign(campaignId);
  console.log("Campaign Token Address:", campaign.tokenAddress);
  console.log("Price Per Token (wei):", campaign.pricePerToken.toString());

  // 4. Advance Time to Start
  console.log("\n[3] Advancing Time to Start...");
  await hre.network.provider.send("evm_increaseTime", [61]);
  await hre.network.provider.send("evm_mine");

  // 5. Invest
  console.log("\n[4] Investor1 Investing...");
  const investAmountTokens = hre.ethers.parseEther("100"); // Buy 100 Tokens
  const pricePerToken = campaign.pricePerToken;
  const cost = (investAmountTokens * pricePerToken) / hre.ethers.parseEther("1");
  
  console.log("Cost for 100 tokens:", hre.ethers.formatEther(cost), "ETH");

  const investTx = await factory.connect(investor1).invest(campaignId, investAmountTokens, { value: cost });
  await investTx.wait();
  console.log("Investment Successful!");

  // 6. Check Balances
  const info = await factory.investorInfo(investor1.address, campaignId);
  console.log("Investor1 Info - Invested:", hre.ethers.formatEther(info.amountInvested), "ETH");
  console.log("Investor1 Info - Tokens:", hre.ethers.formatEther(info.tokensPurchased));

  // Check Token Balance on Token Contract
  const CampaignToken = await hre.ethers.getContractFactory("CampaignToken");
  const tokenContract = CampaignToken.attach(campaign.tokenAddress);
  const bal = await tokenContract.balanceOf(investor1.address);
  console.log("Investor1 Token Balance (ERC20):", hre.ethers.formatEther(bal));

  // 7. Advance to End (Success Case)
  // Need to fund fully to succeed? Or just reach end?
  // Logic: if amountRaised >= goalAmount -> FUNDED.
  // Let's fund fully.
  console.log("\n[5] Funding Remaining to reach Goal...");
  const remainingGoal = goalAmount - cost;
  // Calculate tokens needed for remaining goal
  // cost = (tokens * price) / 1e18  => tokens = (cost * 1e18) / price
  const tokensNeeded = (remainingGoal * hre.ethers.parseEther("1")) / pricePerToken;
  // Add a buffer or just pay precise?
  // Let's just buy enough tokens.
  // Calculate remaining tokens to avoid exceeding supply
  const tokensAlreadyMinted = info.tokensPurchased; // investor1
  const remainingTokens = totalTokenSupply - investAmountTokens; // total - investor1
  
  console.log("Buying remaining tokens:", hre.ethers.formatEther(remainingTokens));
  const investTx2 = await factory.connect(investor2).invest(campaignId, remainingTokens, { value: remainingGoal + 1000000n });
  await investTx2.wait();
  console.log("Campaign Fully Funded!");

  const finalStatus = await factory.getStatus(campaignId);
  // Enum: UPCOMING=0, ACTIVE=1, FUNDED=2, FAILED=3
  const statusStr = ["UPCOMING", "ACTIVE", "FUNDED", "FAILED"][finalStatus];
  console.log("Final Campaign Status:", statusStr);

  // 8. Withdraw
  if (statusStr === "FUNDED") {
      console.log("\n[6] Creator Withdrawing...");
      const oldBal = await hre.ethers.provider.getBalance(creator.address);
      const withdrawTx = await factory.connect(creator).withdraw(campaignId);
      await withdrawTx.wait();
      const newBal = await hre.ethers.provider.getBalance(creator.address);
      console.log("Withdraw Successful. Balance increased by approx:", hre.ethers.formatEther(newBal - oldBal), "ETH");
  } else {
      console.log("Campaign failed, cannot withdraw.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
