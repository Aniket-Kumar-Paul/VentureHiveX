export const fetchCampaigns = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  try {
    const res = await fetch(`${apiUrl}/campaigns`);
    if (!res.ok) throw new Error("Failed to fetch campaigns");
    const data = await res.json();
    return data;
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
  const res = await fetch(`${apiUrl}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(userData)
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
