import { ethers } from "ethers";
import CampaignFactoryJSON from "../abis/CampaignFactory.json";
import CampaignTokenJSON from "../abis/CampaignToken.json";

export const getProvider = () => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  // Fallback for reading data without metamask
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
};

export const getSigner = async () => {
  const provider = getProvider();
  if (provider instanceof ethers.BrowserProvider) {
    return await provider.getSigner();
  }
  throw new Error("No wallet connected and no test key found.");
};

export const getFactoryContract = async (signerOrProvider: ethers.Signer | ethers.Provider) => {
  const address = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
  if (!address) throw new Error("Factory address not set in env");
  return new ethers.Contract(address, CampaignFactoryJSON.abi, signerOrProvider);
};

export const getCampaignContract = (address: string, signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(address, CampaignTokenJSON.abi, signerOrProvider);
};
