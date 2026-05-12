export type Role = "Investoo" | "Investor" | "Business";

export interface User {
  address: string;
  role: Role;
  name: string;
  email: string;
  hasCompletedProfile: boolean;
  gender?: string;
  dob?: string;
  description?: string;
  companyName?: string;
  companyUrl?: string;
}

export type CampaignStatus = "Upcoming" | "Active" | "Funded" | "Failed";

export interface Campaign {
  id: string;
  creatorAddress: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  website: string;
  thumbnailUrl: string;
  videoUrl?: string;
  goalAmount: number;
  totalTokenSupply: number;
  pricePerToken: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  status: CampaignStatus;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  amountRaised: number;
  companyName?: string;
}

export interface Investment {
  id: string;
  investorAddress: string;
  campaignId: string;
  amountInvested: number;
  tokensReceived: number;
  dateInvested: string;
  type?: string;
  txHash?: string;
}

// Dummy Data
export const mockCampaigns: Campaign[] = [
  {
    id: "camp-1",
    creatorAddress: "0xBusinessAddress123",
    title: "Humane \u2014 Humane AI Pin",
    shortDescription: "A standalone, screenless wearable device built from the ground up for AI.",
    longDescription: "The Ai Pin interacts with the world similarly to how humans do\u2014by hearing and seeing\u2014while prioritizing privacy. It's a next-generation wearable device that replaces the smartphone with an AI-first interface.",
    category: "Technology",
    website: "https://humane.com",
    companyName: "Humane Inc.",
    thumbnailUrl: "/thumbnails/humane.png",
    videoUrl: "https://www.youtube.com/watch?v=gMsQO5u7-NQ",
    goalAmount: 5,
    totalTokenSupply: 1000,
    pricePerToken: 0.005,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Active",
    tokenName: "HumaneToken",
    tokenSymbol: "HMN",
    tokenAddress: "0xHumaneTokenAddress",
    amountRaised: 2.5,
  },
  {
    id: "camp-2",
    creatorAddress: "0xBusinessAddress123",
    title: "RAMP - Corporate Cards & Spend Management",
    shortDescription: "Ramp is the ultimate platform for modern finance teams.",
    longDescription: "Ramp is the ultimate platform for modern finance teams. Combining corporate cards with expense management, bill payments, vendor management, accounting automation and more. Over 15,000 businesses on Ramp save an average 3.5% more and close their books 8x faster.",
    category: "Finance",
    website: "https://ramp.com",
    companyName: "Ramp Financial",
    thumbnailUrl: "/thumbnails/ramp.png",
    videoUrl: "https://www.youtube.com/watch?v=nPCpMj7w23s",
    goalAmount: 10,
    totalTokenSupply: 1000,
    pricePerToken: 0.01,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Funded",
    tokenName: "RampToken",
    tokenSymbol: "RMP",
    tokenAddress: "0xRampTokenAddress",
    amountRaised: 12,
  },
  {
    id: "camp-3",
    creatorAddress: "0xBusinessAddress456",
    title: "Neon Nexus VR MMO",
    shortDescription: "A next-generation immersive VR MMO in a cyberpunk world.",
    longDescription: "Experience the ultimate VRMMO where you can trade, fight, and live in a persistent cyberpunk neon-lit universe. Featuring deep lore, economy, and unprecedented graphics.",
    category: "Gaming",
    website: "https://neonnexus.io",
    companyName: "Neon Studios",
    thumbnailUrl: "/thumbnails/gaming.png",
    videoUrl: "",
    goalAmount: 20,
    totalTokenSupply: 100,
    pricePerToken: 0.2,
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Upcoming",
    tokenName: "NeonToken",
    tokenSymbol: "NXT",
    tokenAddress: "0xNeonTokenAddress",
    amountRaised: 0,
  },
  {
    id: "camp-4",
    creatorAddress: "0xBusinessAddress789",
    title: "Digital Renaissance Gallery",
    shortDescription: "A decentralized, community-owned art gallery.",
    longDescription: "Bringing the world's finest digital artists into a decentralized physical and digital hybrid gallery. Token holders vote on exhibitions and share in the revenue of art sales.",
    category: "Art",
    website: "https://digitalrenaissance.art",
    companyName: "Renaissance Art",
    thumbnailUrl: "/thumbnails/art.png",
    videoUrl: "",
    goalAmount: 8,
    totalTokenSupply: 100,
    pricePerToken: 0.08,
    startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Failed",
    tokenName: "ArtToken",
    tokenSymbol: "ART",
    tokenAddress: "0xArtTokenAddress",
    amountRaised: 3.04,
  }
];

export const mockUsers: User[] = [
  {
    address: "0xInvestorAddress123",
    role: "Investor",
    name: "Alice Investor",
    email: "alice@example.com",
    hasCompletedProfile: true,
  },
  {
    address: "0xBusinessAddress123",
    role: "Business",
    name: "Bob Founder",
    email: "bob@humane.com",
    hasCompletedProfile: true,
    companyName: "Humane / Ramp",
  }
];

export const mockInvestments: Investment[] = [
  {
    id: "inv-1",
    investorAddress: "0xInvestorAddress123",
    campaignId: "camp-1",
    amountInvested: 1.5,
    tokensReceived: 300000,
    dateInvested: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: "INVEST"
  },
  {
    id: "inv-2",
    investorAddress: "0xInvestorAddress123",
    campaignId: "camp-2",
    amountInvested: 2,
    tokensReceived: 400000,
    dateInvested: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    type: "INVEST"
  },
  {
    id: "inv-3",
    investorAddress: "0xInvestorAddress123",
    campaignId: "camp-4",
    amountInvested: 1,
    tokensReceived: 125000,
    dateInvested: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    type: "INVEST"
  }
];
