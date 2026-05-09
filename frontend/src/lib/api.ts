import { ethers } from "ethers";

export const fetchCampaigns = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  try {
    const res = await fetch(`${apiUrl}/campaigns`);
    if (!res.ok) throw new Error("Failed to fetch campaigns");
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      return json.data.map((c: any) => ({
        id: c.campaign_id,
        creatorAddress: c.wallet_address,
        title: c.title,
        shortDescription: c.short_description || "",
        longDescription: c.long_description || "",
        category: c.category || "Unknown",
        website: c.website || "",
        thumbnailUrl: c.thumbnail || "https://images.unsplash.com/photo-1557682250-33bd709cbe85",
        videoUrl: c.video_url || "",
        goalAmount: parseFloat(ethers.formatEther(c.goalAmount || "0")),
        totalTokenSupply: parseFloat(ethers.formatEther(c.totalTokenSupply || "0")),
        pricePerToken: parseFloat(ethers.formatEther(c.pricePerToken || "0")),
        startDate: c.startTime,
        endDate: c.endTime,
        status: c.status,
        tokenName: c.tokenName,
        tokenSymbol: c.tokenSymbol,
        tokenAddress: c.tokenAddress || "",
        amountRaised: parseFloat(ethers.formatEther(c.amountRaised || "0"))
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
};

export const fetchCampaignById = async (id: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  try {
    const res = await fetch(`${apiUrl}/campaigns/${id}`);
    if (!res.ok) throw new Error("Failed to fetch campaign details");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching campaign details:", error);
    return null;
  }
};

// --- Auth Endpoints ---

export const fetchNonce = async (address: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const res = await fetch(`${apiUrl}/auth/nonce?walletAddress=${address}`);
  if (!res.ok) throw new Error("Failed to fetch nonce");
  return await res.json();
};

export const verifySignature = async (address: string, signature: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const res = await fetch(`${apiUrl}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress: address, signature })
  });
  if (!res.ok) throw new Error("Signature verification failed");
  return await res.json();
};

// --- Auth Endpoints ---

export const fetchUserProfile = async (token: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const res = await fetch(`${apiUrl}/users/profile`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return await res.json();
};

export const updateUserProfile = async (userData: any, token: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  
  const payload = {
    ...userData,
    company_name: userData.companyName,
    company_url: userData.companyUrl,
  };

  const res = await fetch(`${apiUrl}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update user profile");
  return await res.json();
};

// --- IPFS Endpoints ---

export const uploadFileToIPFS = async (file: File, token: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${apiUrl}/ipfs/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });
  
  if (!res.ok) throw new Error("Failed to upload file to IPFS");
  return await res.json();
};

export const uploadMetadataToIPFS = async (metadata: any, token: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  
  const res = await fetch(`${apiUrl}/ipfs/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(metadata)
  });
  
  if (!res.ok) throw new Error("Failed to upload metadata to IPFS");
  return await res.json();
};
