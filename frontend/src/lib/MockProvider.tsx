"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Campaign, Investment, mockUsers, mockCampaigns, mockInvestments } from "./mockData";
import { toast } from "sonner";

interface MockContextType {
  currentUser: User | null;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  users: User[];
  campaigns: Campaign[];
  investments: Investment[];
  registerUser: (user: User) => void;
  updateUser: (user: User) => void;
  createCampaign: (campaign: Campaign) => void;
  updateCampaign: (campaign: Campaign) => void;
  investInCampaign: (campaignId: string, amount: number) => void;
}

const MockContext = createContext<MockContextType | undefined>(undefined);

export const useMockData = () => {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error("useMockData must be used within a MockProvider");
  }
  return context;
};

export const MockProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);

  // Auto-connect for dev convenience or check local storage if we want
  // useEffect(() => {
  //   const savedAddress = localStorage.getItem("mock_wallet");
  //   if (savedAddress) connectWallet(savedAddress);
  // }, []);

  const connectWallet = (address: string) => {
    const existingUser = users.find(u => u.address.toLowerCase() === address.toLowerCase());
    if (existingUser) {
      setCurrentUser(existingUser);
      toast.success("Wallet connected!", { description: `Welcome back, ${existingUser.name}` });
    } else {
      setCurrentUser({
        address,
        role: "Investor", // default
        name: "",
        email: "",
        hasCompletedProfile: false,
      });
      toast.success("Wallet connected!", { description: "Please complete your profile to continue." });
    }
  };

  const disconnectWallet = () => {
    setCurrentUser(null);
    toast.info("Wallet disconnected");
  };

  const registerUser = (user: User) => {
    setUsers(prev => [...prev.filter(u => u.address !== user.address), user]);
    setCurrentUser(user);
    toast.success("Profile created successfully!");
  };

  const updateUser = (user: User) => {
    setUsers(prev => prev.map(u => u.address === user.address ? user : u));
    setCurrentUser(user);
    toast.success("Profile updated!");
  };

  const createCampaign = (campaign: Campaign) => {
    setCampaigns(prev => [campaign, ...prev]);
    toast.success("Campaign created successfully!");
  };

  const updateCampaign = (campaign: Campaign) => {
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? campaign : c));
    toast.success("Campaign updated successfully!");
  };

  const investInCampaign = (campaignId: string, amountInvested: number) => {
    if (!currentUser) return;
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const tokensReceived = amountInvested / campaign.pricePerToken;
    
    const newInvestment: Investment = {
      id: `inv-${Date.now()}`,
      investorAddress: currentUser.address,
      campaignId,
      amountInvested,
      tokensReceived,
      dateInvested: new Date().toISOString()
    };

    setInvestments(prev => [...prev, newInvestment]);
    
    // Update campaign amount raised
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, amountRaised: c.amountRaised + amountInvested } : c
    ));

    toast.success(`Successfully invested $${amountInvested}!`, {
      description: `You received ${tokensReceived} ${campaign.tokenSymbol}`
    });
  };

  return (
    <MockContext.Provider value={{
      currentUser,
      connectWallet,
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
    </MockContext.Provider>
  );
};
