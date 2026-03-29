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
