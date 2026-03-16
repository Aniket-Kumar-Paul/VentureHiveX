"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIndexer = void 0;
const ethers_1 = require("ethers");
const client_1 = require("@prisma/client");
const CampaignFactory_json_1 = __importDefault(require("../config/CampaignFactory.json"));
const CampaignToken_json_1 = __importDefault(require("../config/CampaignToken.json"));
const prisma = new client_1.PrismaClient();
const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
// You will need to inject the deployed address of the factory after you deploy the contracts
// For now, read from env
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000';
if (!RPC_URL) {
    console.warn('RPC_URL is not defined in .env! Blockchain indexer will not run.');
}
const startIndexer = () => {
    if (!RPC_URL)
        return;
    console.log('Starting Blockchain Indexer connected to:', RPC_URL.split('/')[2]);
    const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
    // Factory Contract setup
    const factoryContract = new ethers_1.ethers.Contract(FACTORY_ADDRESS, CampaignFactory_json_1.default.abi, provider);
    // 1. Listen for new campaigns being created
    factoryContract.on("CampaignCreated", async (campaignId, creator, tokenAddress, title, goalAmount, event) => {
        console.log(`[Indexer] New Campaign Created: ID ${campaignId.toString()} by ${creator}`);
        try {
            // Fetch full details directly from the contract to ensure 100% sync
            // Depends on how getCampaign is structured in your Solidity
            const campaignData = await factoryContract.getCampaign(campaignId);
            // We might need to make sure the user exists first as creators are foreign keys
            const creatorAddress = creator.toLowerCase();
            const existingUser = await prisma.user.findUnique({ where: { wallet_address: creatorAddress } });
            if (!existingUser) {
                await prisma.user.create({
                    data: {
                        wallet_address: creatorAddress,
                        role: 'business'
                    }
                });
            }
            await prisma.campaign.upsert({
                where: { campaign_id: campaignId.toString() },
                update: {
                    tokenAddress: tokenAddress,
                    status: 'UPCOMING', // Or parse from contract enum
                },
                create: {
                    campaign_id: campaignId.toString(),
                    wallet_address: creatorAddress,
                    title: title,
                    goalAmount: goalAmount.toString(),
                    status: 'UPCOMING',
                    // Note: Full IPFS metadata (thumbnails, descriptions, etc) is usually uploaded 
                    // to our backend or to IPFS before creation. If the smart contract ONLY has CID,
                    // we might need to fetch the CID from IPFS and update the local DB.
                    startTime: new Date(Number(campaignData.startTime) * 1000), // Assuming seconds epoch
                    endTime: new Date(Number(campaignData.endTime) * 1000),
                    totalTokenSupply: campaignData.totalTokenSupply.toString(),
                    pricePerToken: campaignData.pricePerToken.toString(),
                    tokenName: "Token", // Ideally read from token contract
                    tokenSymbol: "TKN",
                    tokenAddress: tokenAddress
                }
            });
            console.log(`[Indexer] Successfully synced Campaign ${campaignId.toString()} to DB.`);
        }
        catch (error) {
            console.error(`[Indexer] Error syncing CampaignCreated event:`, error);
        }
    });
    // 2. Listen for Investments
    factoryContract.on("Invested", async (campaignId, investor, amountInvested, tokensTokensReceived, event) => {
        console.log(`[Indexer] Investment Received: ${amountInvested.toString()} wei on Campaign ${campaignId.toString()}`);
        try {
            const investorAddress = investor.toLowerCase();
            // Ensure investor exists
            const existingUser = await prisma.user.findUnique({ where: { wallet_address: investorAddress } });
            if (!existingUser) {
                await prisma.user.create({
                    data: {
                        wallet_address: investorAddress,
                        role: 'investor'
                    }
                });
            }
            // Record Investment
            await prisma.investor.upsert({
                where: {
                    wallet_address_campaign_id: {
                        wallet_address: investorAddress,
                        campaign_id: campaignId.toString()
                    }
                },
                update: {
                    amount_invested: { set: amountInvested.toString() }, // Depending on if it's cumulative in event
                    tokens_purchased: { set: tokensTokensReceived.toString() }
                },
                create: {
                    wallet_address: investorAddress,
                    campaign_id: campaignId.toString(),
                    amount_invested: amountInvested.toString(),
                    tokens_purchased: tokensTokensReceived.toString()
                }
            });
            // Update Campaign raised amount
            const campaignData = await factoryContract.getCampaign(campaignId);
            const campaignRecord = await prisma.campaign.findUnique({ where: { campaign_id: campaignId.toString() } });
            const currentTokenAddress = campaignRecord?.tokenAddress || '';
            await prisma.campaign.update({
                where: { campaign_id: campaignId.toString() },
                data: {
                    amountRaised: campaignData.amountRaised.toString(),
                    mintedSupply: currentTokenAddress ? (await fetchTokenSupply(currentTokenAddress, provider)).toString() : "0" // If you need exact supply
                }
            });
        }
        catch (error) {
            console.error(`[Indexer] Error syncing Invested event:`, error);
        }
    });
};
exports.startIndexer = startIndexer;
const fetchTokenSupply = async (tokenAddress, provider) => {
    try {
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, CampaignToken_json_1.default.abi, provider);
        return await tokenContract.totalSupply();
    }
    catch (e) {
        return 0n;
    }
};
