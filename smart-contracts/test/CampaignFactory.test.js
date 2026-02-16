const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CampaignFactory", function () {
  async function deployFactoryFixture() {
    const [owner, creator, investor1, investor2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CampaignFactory");
    const factory = await Factory.deploy();
    return { factory, owner, creator, investor1, investor2 };
  }

  describe("Campaign Creation", function () {
    it("Should create a new campaign correctly", async function () {
      const { factory, creator } = await loadFixture(deployFactoryFixture);
      
      const goal = ethers.parseEther("10"); // 10 ETH
      const start = Math.floor(Date.now() / 1000) + 60; // Start in 1 min
      const end = start + 3600; // End in 1 hour
      const supply = ethers.parseEther("1000"); // 1000 Tokens
      
      await expect(factory.connect(creator).createCampaign(
        goal,
        start,
        end,
        supply,
        "Test Token",
        "TST",
        "QmHash"
      )).to.emit(factory, "CampaignCreated");

      const campaign = await factory.campaigns(0);
      expect(campaign.creator).to.equal(creator.address);
      expect(campaign.goalAmount).to.equal(goal);
      expect(campaign.tokenSymbol).to.equal("TST");
    });
  });

  describe("Investment", function () {
    async function deployCampaignFixture() {
      const { factory, creator, investor1, investor2 } = await loadFixture(deployFactoryFixture);
      
      const goal = ethers.parseEther("2"); // 2 ETH Goal
      const start = Math.floor(Date.now() / 1000) + 60; 
      const end = start + 3600;
      const supply = ethers.parseEther("100"); // 100 Tokens
      
      // Price = 2 ETH / 100 Tokens = 0.02 ETH per token
      
      await factory.connect(creator).createCampaign(goal, start, end, supply, "Test", "TST", "Qm");
      
      // Advance time to start
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);

      return { factory, creator, investor1, investor2, start, end };
    }

    it("Should allow investment when active", async function () {
      const { factory, investor1 } = await loadFixture(deployCampaignFixture);
      
      // Buy 10 tokens. Price is 0.02 ETH each -> 0.2 ETH total.
      const tokensToBuy = ethers.parseEther("10");
      // Price calculation in contract: (10e18 * 0.02e18) / 1e18 = 0.2e18
      const cost = ethers.parseEther("0.2");
      
      await expect(factory.connect(investor1).invest(0, tokensToBuy, { value: cost }))
        .to.emit(factory, "Invested")
        .withArgs(0, investor1.address, cost, tokensToBuy);
        
      const campaign = await factory.campaigns(0);
      expect(campaign.amountRaised).to.equal(cost);
      expect(campaign.mintedSupply).to.equal(tokensToBuy);
    });

    it("Should fail if insufficient ETH sent", async function () {
       const { factory, investor1 } = await loadFixture(deployCampaignFixture);
       const tokensToBuy = ethers.parseEther("10");
       const cost = ethers.parseEther("0.1"); // Sending half required
       
       await expect(factory.connect(investor1).invest(0, tokensToBuy, { value: cost }))
         .to.be.revertedWith("Result: Insufficient ETH sent");
    });
  });

  describe("Funding & Withdraw", function () {
    it("Should allow creator to withdraw if funded", async function () {
      const { factory, creator, investor1, investor2 } = await loadFixture(deployFactoryFixture);
      const goal = ethers.parseEther("1");
      const start = Math.floor(Date.now() / 1000) + 60;
      const end = start + 3600;
      const supply = ethers.parseEther("100");
      
      await factory.connect(creator).createCampaign(goal, start, end, supply, "T", "T", "Qm");
      
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);
      
      // Investor buys all tokens (funding the goal)
      // Price = 1 ETH / 100 = 0.01 ETH
      // Buy 100 tokens -> 1 ETH cost.
      const tokens = ethers.parseEther("100");
      const cost = ethers.parseEther("1");
      
      await factory.connect(investor1).invest(0, tokens, { value: cost });
      
      const campaign = await factory.campaigns(0);
      expect(campaign.amountRaised).to.equal(cost);
      
      // Status should be FUNDED
      const status = await factory.getStatus(0);
      expect(status).to.equal(2); // FUNDED
      
      // Withdraw
      await expect(factory.connect(creator).withdraw(0))
        .to.emit(factory, "FundsWithdrawn")
        .withArgs(0, creator.address, cost);
    });
  });

  describe("Refund", function () {
    it("Should allow refund if failed", async function () {
      const { factory, creator, investor1 } = await loadFixture(deployFactoryFixture);
      const goal = ethers.parseEther("10"); // High goal
      const start = Math.floor(Date.now() / 1000) + 60;
      const end = start + 3600;
      const supply = ethers.parseEther("100");
      
      await factory.connect(creator).createCampaign(goal, start, end, supply, "T", "T", "Qm");
      
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);
      
      // Invest small amount (not reaching goal)
      const tokens = ethers.parseEther("1"); // 1 token
      const cost = ethers.parseEther("0.1"); // 0.1 ETH
      
      await factory.connect(investor1).invest(0, tokens, { value: cost });
      
      // Fast forward to end
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);
      
      const status = await factory.getStatus(0);
      expect(status).to.equal(3); // FAILED
      
      // Refund
      await expect(factory.connect(investor1).refund(0))
        .to.emit(factory, "Refunded")
        .withArgs(0, investor1.address, cost, tokens);
    });
  });

});
