"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { getSigner, getFactoryContract } from "@/lib/web3";
import { ethers } from "ethers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCampaignModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    durationDays: "30",
    tokenName: "",
    tokenSymbol: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLaunch = async () => {
    setLoading(true);
    try {
      // 1. Upload Metadata to IPFS Backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      
      /* In a real scenario we need a token for this endpoint since it's auth-protected. 
         For testing, assuming either auth is bypassed in dev or we provide a mock token. */
      const res = await fetch(`${apiUrl}/ipfs/metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          thumbnail: "ipfs://mock",
          video: "ipfs://mock",
          category: "Technology",
          website: "https://example.com"
        })
      });

      let metadataCID = "mockCID";
      if (res.ok) {
        const data = await res.json();
        metadataCID = data.ipfsHash || "mockCID";
      }

      // 2. Call Smart Contract
      const signer = await getSigner();
      const factory = await getFactoryContract(signer);
      
      const goalWei = ethers.parseEther(formData.goal || "0");
      const durationSeconds = parseInt(formData.durationDays) * 24 * 60 * 60;
      
      console.log("Creating campaign on-chain...");
      const tx = await factory.createCampaign(
        goalWei,
        durationSeconds,
        metadataCID,
        formData.tokenName,
        formData.tokenSymbol
      );
      
      await tx.wait();
      console.log("Campaign created successfully!");
      
      onClose();
    } catch (err) {
      console.error("Error creating campaign:", err);
      alert("Failed to create campaign. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-zinc-950/80 backdrop-blur-xl border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">
            Launch New Startup Campaign
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white/80">Campaign Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} className="bg-zinc-900 border-white/10" placeholder="e.g. NeoTrade Protocol" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/80">Description</Label>
                <textarea 
                  id="description" name="description" value={formData.description} onChange={handleChange}
                  className="w-full min-h-24 px-3 py-2 rounded-md bg-zinc-900 border border-white/10 outline-none focus:border-primary text-sm"
                  placeholder="Describe your startup..." 
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full mt-4">Next Step</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-white/80">Goal (ETH)</Label>
                  <Input id="goal" name="goal" type="number" value={formData.goal} onChange={handleChange} className="bg-zinc-900 border-white/10" placeholder="e.g. 100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDays" className="text-white/80">Duration (Days)</Label>
                  <Input id="durationDays" name="durationDays" type="number" value={formData.durationDays} onChange={handleChange} className="bg-zinc-900 border-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenName" className="text-white/80">Token Name</Label>
                  <Input id="tokenName" name="tokenName" value={formData.tokenName} onChange={handleChange} className="bg-zinc-900 border-white/10" placeholder="e.g. NeoTrade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol" className="text-white/80">Token Symbol</Label>
                  <Input id="tokenSymbol" name="tokenSymbol" value={formData.tokenSymbol} onChange={handleChange} className="bg-zinc-900 border-white/10" placeholder="e.g. NEO" />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="w-1/3 bg-transparent border-white/10">Back</Button>
                <Button onClick={handleLaunch} disabled={loading} className="w-2/3 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                  {loading ? "Deploying..." : "Launch Campaign"}
                </Button>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
