import { ethers } from 'ethers';
import prisma from '../config/prismaClient';
import FactoryABI from '../config/CampaignFactory.json';
import TokenABI from '../config/CampaignToken.json';

const RPC_URL = process.env.SEPOLIA_RPC_URL || "";

// You will need to inject the deployed address of the factory after you deploy the contracts
// For now, read from env
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000';

if (!RPC_URL) {
  console.warn('RPC_URL is not defined in .env! Blockchain indexer will not run.');
}

export const startIndexer = () => {
  if (!RPC_URL) return;

  console.log('Starting Blockchain Indexer connected to:', RPC_URL.split('/')[2]);
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Factory Contract setup
  const factoryContract = new ethers.Contract(FACTORY_ADDRESS, FactoryABI.abi, provider);

  // 1. Listen for new campaigns being created
  factoryContract.on("CampaignCreated", async (
    campaignId: bigint,
    creator: string,
    tokenName: string,
    tokenSymbol: string,
    goalAmount: bigint,
    startTime: bigint,
    endTime: bigint,
    event: any
  ) => {
    console.log(`[Indexer] New Campaign Created: ID ${campaignId.toString()} by ${creator}`);
    
    try {
      // Fetch full details directly from the contract to ensure 100% sync
      const campaignData = await factoryContract.getCampaign(campaignId);

      // Fetch metadata from IPFS
      let metadata: any = {};
      if (campaignData.metadataCID) {
        try {
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${campaignData.metadataCID}`);
          if (response.ok) {
            metadata = await response.json();
          }
        } catch (e) {
          console.error(`[Indexer] Failed to fetch IPFS metadata for CID ${campaignData.metadataCID}`, e);
        }
      }

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
          tokenAddress: campaignData.tokenAddress,
          status: 'UPCOMING', // Or parse from contract enum
          thumbnail: metadata.thumbnail || null,
          video_url: metadata.video || null,
          short_description: metadata.description || null,
          category: metadata.category || null,
          website: metadata.website || null,
          title: metadata.title || 'Untitled Campaign'
        },
        create: {
          campaign_id: campaignId.toString(),
          wallet_address: creatorAddress,
          title: metadata.title || 'Untitled Campaign',
          thumbnail: metadata.thumbnail || null,
          video_url: metadata.video || null,
          short_description: metadata.description || null,
          category: metadata.category || null,
          website: metadata.website || null,
          goalAmount: goalAmount.toString(),
          status: 'UPCOMING',
          startTime: new Date(Number(campaignData.startTime) * 1000), // Assuming seconds epoch
          endTime: new Date(Number(campaignData.endTime) * 1000),
          totalTokenSupply: campaignData.totalTokenSupply.toString(),
          pricePerToken: campaignData.pricePerToken.toString(),
          tokenName: tokenName,
          tokenSymbol: tokenSymbol,
          tokenAddress: campaignData.tokenAddress
        }
      });
      console.log(`[Indexer] Successfully synced Campaign ${campaignId.toString()} to DB.`);
    } catch (error) {
      console.error(`[Indexer] Error syncing CampaignCreated event:`, error);
    }
  });

  // 2. Listen for Investments
  factoryContract.on("Invested", async (
    campaignId: bigint,
    investor: string,
    amountInvested: bigint,
    tokensTokensReceived: bigint,
    event: any
  ) => {
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

    } catch (error) {
      console.error(`[Indexer] Error syncing Invested event:`, error);
    }
  });

  // 3. Campaign Metadata Updated
  factoryContract.on("CampaignMetadataUpdated", async (
    campaignId: bigint,
    newCID: string,
    event: any
  ) => {
    console.log(`[Indexer] Campaign Metadata Updated: ID ${campaignId.toString()}`);
    try {
      let metadata: any = {};
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${newCID}`);
      if (response.ok) {
        metadata = await response.json();
      }
      if (metadata.title) {
        await prisma.campaign.update({
          where: { campaign_id: campaignId.toString() },
          data: {
            thumbnail: metadata.thumbnail || null,
            video_url: metadata.video || null,
            short_description: metadata.description || null,
            category: metadata.category || null,
            website: metadata.website || null,
            title: metadata.title || 'Untitled Campaign'
          }
        });
      }
    } catch (error) {
      console.error(`[Indexer] Error syncing CampaignMetadataUpdated event:`, error);
    }
  });

  // 4. Funds Withdrawn
  factoryContract.on("FundsWithdrawn", async (
    campaignId: bigint,
    creator: string,
    amount: bigint,
    event: any
  ) => {
    console.log(`[Indexer] Funds Withdrawn: Campaign ${campaignId.toString()}`);
    try {
      await prisma.campaign.update({
        where: { campaign_id: campaignId.toString() },
        data: { status: 'FUNDED' }
      });
    } catch (error) {
      console.error(`[Indexer] Error syncing FundsWithdrawn event:`, error);
    }
  });

  // 5. Refunded
  factoryContract.on("Refunded", async (
    campaignId: bigint,
    investor: string,
    amountRefuned: bigint,
    tokensBurned: bigint,
    event: any
  ) => {
    console.log(`[Indexer] Refunded: Investor ${investor} for Campaign ${campaignId.toString()}`);
    try {
      const investorAddress = investor.toLowerCase();
      await prisma.investor.update({
        where: {
          wallet_address_campaign_id: {
             wallet_address: investorAddress,
             campaign_id: campaignId.toString()
          }
        },
        data: {
           amount_invested: '0',
           tokens_purchased: '0'
        }
      });
    } catch (error) {
      console.error(`[Indexer] Error syncing Refunded event:`, error);
    }
  });
};

const fetchTokenSupply = async (tokenAddress: string, provider: ethers.Provider): Promise<bigint> => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, TokenABI.abi, provider);
    return await tokenContract.totalSupply();
  } catch (e) {
    return 0n;
  }
};
