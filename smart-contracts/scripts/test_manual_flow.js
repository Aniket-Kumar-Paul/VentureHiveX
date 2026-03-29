require("dotenv").config({ path: '../backend/.env' });
const hre = require("hardhat");

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function txWait(tx, confirmations = 1) {
    const isLive = hre.network.name !== "hardhat" && hre.network.name !== "localhost";
    const confs = isLive ? confirmations : 1;
    const receipt = await tx.wait(confs);
    return receipt;
}

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  
  // On local network we have 20 accounts. On Sepolia we might only have 1 (from .env).
  const creator = signers[0];
  const investor1 = signers.length > 1 ? signers[1] : signers[0];
  const investor2 = signers.length > 2 ? signers[2] : signers[0];

  const isLocal = hre.network.name === "hardhat" || hre.network.name === "localhost";

  console.log("--- Starting Manual Testing Flow ---");
  console.log("Network:", hre.network.name);
  console.log("Deployer / Creator:", creator.address);
  console.log("Investor1:", investor1.address);
  console.log("Investor2:", investor2.address);

  // 1. Use existing Factory
  const factoryAddress = process.env.FACTORY_ADDRESS;
  const factory = await hre.ethers.getContractAt("CampaignFactory", factoryAddress);
  console.log("\n[1] Using Factory at:", factoryAddress);

  // 2. Create Campaign
  // Goal amount 0.001 ETH makes it cheap enough for testnets
  const goalAmount = hre.ethers.parseEther("0.001");
  const totalTokenSupply = hre.ethers.parseEther("10000"); // 10,000 Tokens
  
  let currentBlock = await hre.ethers.provider.getBlock("latest");
  if (!currentBlock) {
    await hre.network.provider.send("evm_mine");
    currentBlock = await hre.ethers.provider.getBlock("latest");
  }
  // If local, start in 10s, if testnet start in 60s so we can wait naturally for 1-3 blocks
  const delaySeconds = 60;
  const startTime = currentBlock.timestamp + delaySeconds; 
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
  
  console.log(`Transaction submitted: ${createTx.hash}`);
  const receipt = await txWait(createTx, 1);
  
  const event = receipt.logs.find(log => {
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
  console.log(`\n[3] Waiting for Campaign to Start (Need to reach time ${startTime})...`);
  if (isLocal) {
    await hre.network.provider.send("evm_increaseTime", [delaySeconds + 1]);
    await hre.network.provider.send("evm_mine");
  } else {
    let nowBlock = await hre.ethers.provider.getBlock("latest");
    while (nowBlock.timestamp < startTime) {
      const waitTime = startTime - nowBlock.timestamp;
      console.log(`Waiting ${waitTime} seconds... (current block time: ${nowBlock.timestamp})`);
      await sleep(10000); // Check every 10s
      nowBlock = await hre.ethers.provider.getBlock("latest");
    }
    console.log(`Time reached! Current block time: ${nowBlock.timestamp}`);
  }

  // 5. Invest
  console.log("\n[4] Investor1 Investing...");
  const investAmountTokens = hre.ethers.parseEther("100"); // Buy 100 Tokens
  const pricePerToken = campaign.pricePerToken;
  const cost = (investAmountTokens * pricePerToken) / hre.ethers.parseEther("1");
  
  console.log("Cost for 100 tokens:", hre.ethers.formatEther(cost), "ETH");

  const investTx = await factory.connect(investor1).invest(campaignId, investAmountTokens, { value: cost });
  console.log(`Investment TX submitted: ${investTx.hash}`);
  await txWait(investTx, 1);
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
  console.log("\n[5] Funding Remaining to reach Goal...");
  const remainingGoal = goalAmount - cost;
  
  const tokensAlreadyMinted = info.tokensPurchased; 
  const remainingTokens = totalTokenSupply - investAmountTokens; 
  
  console.log("Buying remaining tokens:", hre.ethers.formatEther(remainingTokens));
  const investTx2 = await factory.connect(investor2).invest(campaignId, remainingTokens, { value: remainingGoal + 1000000n }); // Slight overpay for safety 
  console.log(`Second investment TX submitted: ${investTx2.hash}`);
  await txWait(investTx2, 1);
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
      console.log(`Withdraw TX submitted: ${withdrawTx.hash}`);
      await txWait(withdrawTx, 1);
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
