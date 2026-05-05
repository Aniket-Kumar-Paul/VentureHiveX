"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Campaign, Investment, mockUsers, mockCampaigns, mockInvestments } from "./mockData";
import { toast } from "sonner";
import { getProvider, getSigner, getFactoryContract, getCampaignContract } from "./web3";
import { fetchCampaigns as fetchRealCampaigns, fetchNonce, verifySignature, uploadFileToIPFS, uploadMetadataToIPFS, fetchUserProfile, updateUserProfile } from "./api";

// Assuming we have ethers installed
import { ethers } from "ethers";

export type AppMode = 'mock' | 'real';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  currentUser: User | null;
  connectMockWallet: (address: string) => void;
  connectMetamask: () => Promise<void>;
  disconnectWallet: () => void;
  users: User[];
  campaigns: Campaign[];
  investments: Investment[];
  registerUser: (user: User) => Promise<void> | void;
  updateUser: (user: User) => Promise<void> | void;
  createCampaign: (campaign: Campaign, file?: File) => Promise<void>;
  updateCampaign: (campaign: Campaign) => void;
  investInCampaign: (campaignId: string, amount: number, tokenAddress?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<AppMode>('mock');
  
  // Real State
  const [realUser, setRealUser] = useState<User | null>(null);
  const [realCampaigns, setRealCampaigns] = useState<Campaign[]>([]);
  const [realInvestments, setRealInvestments] = useState<Investment[]>([]);
  
  // Mock State
  const [mockCurrentUser, setMockCurrentUser] = useState<User | null>(null);
  const [mockUsersState, setMockUsers] = useState<User[]>(mockUsers);
  const [mockCampaignsState, setMockCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [mockInvestmentsState, setMockInvestments] = useState<Investment[]>(mockInvestments);

  // Derived state depending on mode
  const currentUser = mode === 'mock' ? mockCurrentUser : realUser;
  const users = mode === 'mock' ? mockUsersState : []; // In real mode, we might only know about current user
  const campaigns = mode === 'mock' ? mockCampaignsState : realCampaigns;
  const investments = mode === 'mock' ? mockInvestmentsState : realInvestments;

  // Real Mode: Load Campaigns on mount or mode change
  useEffect(() => {
    if (mode === 'real') {
      const loadCampaigns = async () => {
        try {
          const data = await fetchRealCampaigns();
          if (data && Array.isArray(data)) {
            // Note: DB returns data matching Campaign type mostly, but we map it if necessary
            setRealCampaigns(data);
          }
        } catch (error) {
          console.error("Failed to fetch real campaigns", error);
        }
      };
      loadCampaigns();
    }
  }, [mode]);

  // Handle account changes
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (mode === 'real') {
          // Force re-authentication on any account change or disconnect
          disconnectWallet();
        }
      };
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [mode]);

  const connectMockWallet = (address: string) => {
    setMode('mock');
    const existingUser = mockUsersState.find(u => u.address.toLowerCase() === address.toLowerCase());
    if (existingUser) {
      setMockCurrentUser(existingUser);
      toast.success("Wallet connected (Demo)!", { description: `Welcome back, ${existingUser.name}` });
    } else {
      setMockCurrentUser({
        address,
        role: "Investor", // default
        name: "",
        email: "",
        hasCompletedProfile: false,
      });
      toast.success("Wallet connected (Demo)!", { description: "Please complete your profile to continue." });
    }
  };

  const connectMetamask = async () => {
    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        toast.error("Metamask not found", { description: "Please install Metamask to use real mode." });
        return;
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts && accounts.length > 0) {
        setMode('real');
        const address = accounts[0];
        
        let token = localStorage.getItem('token');
        let needsAuth = !token;
        let fetchedProfile = null;
        
        if (token) {
          try {
            // Verify if the token belongs to the CURRENT address
            fetchedProfile = await fetchUserProfile(token);
            if (fetchedProfile.wallet_address.toLowerCase() !== address.toLowerCase()) {
              needsAuth = true;
              localStorage.removeItem('token');
            }
          } catch (err) {
            needsAuth = true;
            localStorage.removeItem('token');
          }
        }

        if (needsAuth) {
          toast.loading("Authenticating signature...", { id: "auth" });
          const { message } = await fetchNonce(address);
          const signer = await provider.getSigner();
          const signature = await signer.signMessage(message);
          const data = await verifySignature(address, signature);
          token = data.token;
          if (token) {
            localStorage.setItem('token', token);
            toast.success("Authenticated successfully", { id: "auth" });
            fetchedProfile = await fetchUserProfile(token); // Fetch fresh profile
          } else {
            toast.error("Failed to authenticate", { id: "auth" });
            return;
          }
        }
        
        try {
          if (fetchedProfile) {
            setRealUser({
              address: fetchedProfile.wallet_address || address,
              role: fetchedProfile.role || "Investor",
              name: fetchedProfile.name || "",
              email: fetchedProfile.email || "",
              description: fetchedProfile.description || "",
              company_name: fetchedProfile.company_name,
              company_url: fetchedProfile.company_url,
              hasCompletedProfile: !!fetchedProfile.name
            });
          } else {
            throw new Error("No profile data");
          }
        } catch (err) {
          console.warn("Could not set user profile, using defaults", err);
          setRealUser({
            address,
            role: "Investor",
            name: "",
            email: "",
            hasCompletedProfile: false
          });
        }
        toast.success("Connected with Metamask", { description: `Address: ${address.slice(0,6)}...` });
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to connect", { description: error.message });
    }
  };

  const disconnectWallet = () => {
    if (mode === 'mock') {
      setMockCurrentUser(null);
    } else {
      localStorage.removeItem('token');
      setRealUser(null);
    }
    toast.info("Wallet disconnected");
  };

  const registerUser = async (user: User) => {
    if (mode === 'mock') {
      setMockUsers(prev => [...prev.filter(u => u.address !== user.address), user]);
      setMockCurrentUser(user);
      toast.success("Profile created successfully!");
    } else {
      try {
        const token = localStorage.getItem('token') || '';
        await updateUserProfile(user, token);
        setRealUser(user);
        toast.success("Profile created successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to create profile");
      }
    }
  };

  const updateUser = async (user: User) => {
    if (mode === 'mock') {
      setMockUsers(prev => prev.map(u => u.address === user.address ? user : u));
      setMockCurrentUser(user);
      toast.success("Profile updated!");
    } else {
      try {
        const token = localStorage.getItem('token') || '';
        await updateUserProfile(user, token);
        setRealUser(user);
        toast.success("Profile updated!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to update profile");
      }
    }
  };

  const createCampaign = async (campaign: Campaign, file?: File) => {
    if (mode === 'mock') {
      setMockCampaigns(prev => [campaign, ...prev]);
      toast.success("Campaign created successfully (Mock)!");
    } else {
      try {
        toast.loading("Uploading metadata to IPFS...");
        // This normally requires file and metadata. We'll simulate the real IPFS call
        // Assuming we got auth token
        const token = localStorage.getItem('token') || '';
        if (!file && !campaign.thumbnailUrl) {
          throw new Error("File missing");
        }
        
        // Proceed with file upload if given
        let ipfsImageUrl = "";
        if (file) {
          const fileUpload = await uploadFileToIPFS(file, token);
          ipfsImageUrl = `https://gateway.pinata.cloud/ipfs/${fileUpload.ipfsHash}`;
        } else if (campaign.thumbnailUrl) {
          ipfsImageUrl = campaign.thumbnailUrl;
        }

        const metadataUpload = await uploadMetadataToIPFS({
          title: campaign.title,
          description: campaign.shortDescription,
          thumbnail: ipfsImageUrl,
          video: campaign.videoUrl,
          category: campaign.category,
          website: campaign.website,
        }, token);

        toast.loading("Deploying smart contract...", { id: "deploy" });
        const signer = await getSigner();
        const factory = await getFactoryContract(signer);
        
        // Need parameters matching CampaignFactory signature
        // goalAmount, startTime, endTime, totalTokenSupply, tokenName, tokenSymbol, metadataCID
        const goalAmountWei = ethers.parseEther(campaign.goalAmount.toString());
        const startTimestamp = Math.floor(new Date(campaign.startDate).getTime() / 1000);
        const endTimestamp = Math.floor(new Date(campaign.endDate).getTime() / 1000);
        
        const tx = await factory.createCampaign(
            goalAmountWei,
            startTimestamp, // start
            endTimestamp, // end
            campaign.totalTokenSupply || 1000000,
            campaign.tokenSymbol + " Token",
            campaign.tokenSymbol || "TKN",
            metadataUpload.ipfsHash
        );
        toast.loading("Waiting for confirmation...", { id: "deploy" });
        await tx.wait();

        toast.success("Campaign deployed successfully!", { id: "deploy" });
        
        // Append locally or wait for indexer
      } catch (error: any) {
        toast.dismiss();
        console.error(error);
        toast.error("Deployment failed", { description: error.message });
      }
    }
  };

  const updateCampaign = (campaign: Campaign) => {
    if (mode === 'mock') {
      setMockCampaigns(prev => prev.map(c => c.id === campaign.id ? campaign : c));
      toast.success("Campaign updated successfully!");
    } else {
      // API / Contract Call
    }
  };

  const investInCampaign = async (campaignId: string, amountInvested: number, tokenAddress?: string) => {
    if (!currentUser) return;
    
    if (mode === 'mock') {
      const campaign = mockCampaignsState.find(c => c.id === campaignId);
      if (!campaign) return;

      const tokensReceived = amountInvested / (campaign.pricePerToken || 1);
      
      const newInvestment: Investment = {
        id: `inv-${Date.now()}`,
        investorAddress: currentUser.address,
        campaignId,
        amountInvested,
        tokensReceived,
        dateInvested: new Date().toISOString()
      };

      setMockInvestments(prev => [...prev, newInvestment]);
      
      setMockCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, amountRaised: c.amountRaised + amountInvested } : c
      ));

      toast.success(`Successfully invested $${amountInvested} (Mock)!`, {
        description: `You received ${tokensReceived} ${campaign.tokenSymbol}`
      });
    } else {
      try {
        if (!tokenAddress) throw new Error("No token address for campaign");
        toast.loading("Sending investment transaction...");
        const signer = await getSigner();
        const contract = getCampaignContract(tokenAddress, signer);
        
        const tx = await contract.invest({ value: ethers.parseEther(amountInvested.toString()) });
        await tx.wait();
        toast.dismiss();
        toast.success("Investment successful!");
      } catch (error: any) {
        toast.dismiss();
        console.error(error);
        toast.error("Investment failed", { description: error.message });
      }
    }
  };

  return (
    <AppContext.Provider value={{
      mode,
      setMode,
      currentUser,
      connectMockWallet,
      connectMetamask,
      disconnectWallet,
      users,
      campaigns,
      investments,
      registerUser,
      updateUser,
      createCampaign,
      updateCampaign,
      investInCampaign
    }}>
      {children}
    </AppContext.Provider>
  );
};
