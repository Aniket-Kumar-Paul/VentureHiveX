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
    title: "EcoTech Innovators",
    shortDescription: "Revolutionizing green energy with smart AI solutions.",
    longDescription: "We are building an AI-driven platform to optimize solar power grids and reduce energy waste globally. Join our mission to create a sustainable future.",
    category: "Sustainable Energy",
    website: "https://eco-charge.io",
    companyName: "EcoCharge Inc.",
    thumbnailUrl: "/thumbnails/eco_tech.png",
    videoUrl: "",
    goalAmount: 100000,
    totalTokenSupply: 1000000,
    pricePerToken: 0.1,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Active",
    tokenName: "EcoToken",
    tokenSymbol: "ECO",
    tokenAddress: "0xEcoTokenAddress",
    amountRaised: 45000,
  },
  {
    id: "camp-2",
    creatorAddress: "0xBusinessAddress456",
    title: "NextGen Gaming Console",
    shortDescription: "A decentralized gaming console powered by Web3.",
    longDescription: "Our console integrates seamlessly with blockchain, allowing players to truly own their in-game assets. Support us to bring true ownership to gaming.",
    category: "AI & Machine Learning",
    website: "https://neuralbridge.ai",
    companyName: "NeuralBridge Tech",
    thumbnailUrl: "/thumbnails/gaming_console.png",
    videoUrl: "https://www.youtube.com/watch?v=G6aUE2OQWZs",
    goalAmount: 1000000,
    totalTokenSupply: 5000000,
    pricePerToken: 0.1,
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Upcoming",
    tokenName: "PlayGen",
    tokenSymbol: "PGEN",
    tokenAddress: "0xPGenTokenAddress",
    amountRaised: 0,
  },
  {
    id: "camp-3",
    creatorAddress: "0xBusinessAddress123",
    title: "DeFi Lending Protocol",
    shortDescription: "Peer-to-peer lending with ultra-low fees.",
    longDescription: "Bypassing traditional banks, our DeFi protocol connects borrowers and lenders directly with smart contracts, ensuring security and low overhead.",
    category: "Finance",
    website: "https://defilend.example.com",
    thumbnailUrl: "/thumbnails/defi_protocol.png",
    goalAmount: 200000,
    totalTokenSupply: 2000000,
    pricePerToken: 0.1,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Funded",
    tokenName: "LendToken",
    tokenSymbol: "LEND",
    tokenAddress: "0xLendTokenAddress",
    amountRaised: 250000,
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
    email: "bob@example.com",
    hasCompletedProfile: true,
    companyName: "EcoTech / DeFi",
  }
];

export const mockInvestments: Investment[] = [
  {
    id: "inv-1",
    investorAddress: "0xInvestorAddress123",
    campaignId: "camp-1",
    amountInvested: 1000,
    tokensReceived: 10000,
    dateInvested: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
