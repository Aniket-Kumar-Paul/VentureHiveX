"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/AppProvider";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const steps = ["Content", "Funding", "Token", "Review"];

export function CreateCampaignModal({ isOpen, onClose }: Props) {
  const { currentUser, createCampaign, campaigns } = useApp();
  const [step, setStep] = useState(0);

  // Form State
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [category, setCategory] = useState("Technology");
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState("");
  const [website, setWebsite] = useState("");

  const [goalAmount, setGoalAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalTokenSupply, setTotalTokenSupply] = useState("");
  
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenError, setTokenError] = useState("");

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    // Check token symbol uniqueness dummy
    if (campaigns.some(c => c.tokenSymbol.toLowerCase() === tokenSymbol.toLowerCase())) {
      setTokenError("Token symbol already exists.");
      setStep(2);
      return;
    }

    const pricePerToken = parseFloat(goalAmount) / parseFloat(totalTokenSupply);
    
    createCampaign({
      id: `camp-${Date.now()}`,
      creatorAddress: currentUser.address,
      title,
      shortDescription: shortDesc,
      longDescription: longDesc,
      category,
      website,
      thumbnailUrl: thumbnail || "https://images.unsplash.com/photo-1557682250-33bd709cbe85",
      videoUrl,
      goalAmount: parseFloat(goalAmount),
      totalTokenSupply: parseFloat(totalTokenSupply),
      pricePerToken,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: "Upcoming",
      tokenName,
      tokenSymbol,
      tokenAddress: `0xMockToken${Date.now()}`,
      amountRaised: 0,
    }, thumbnailFile);
    
    // Reset and close
    setStep(0);
    onClose();
  };

  const nextStep = () => {
    if (step === 0) {
      if (!title || !category || !shortDesc || !thumbnail) {
        toast.error("Please fill in all mandatory fields (*).");
        return;
      }
    }
    if (step === 1) {
      if (!goalAmount || !startDate || !endDate || !totalTokenSupply) {
        toast.error("Please fill in all mandatory fields (*).");
        return;
      }
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      const now = new Date();
      if (sDate.getTime() <= now.getTime() + 60000) {
        toast.error("Start date must be at least 1 minute in the future.");
        return;
      }
      if (eDate <= sDate) {
        toast.error("End date must be after start date.");
        return;
      }
    }
    if (step === 2) {
      if (!tokenName || !tokenSymbol) {
        toast.error("Please fill in all mandatory fields (*).");
        return;
      }
      if (campaigns.some(c => c.tokenSymbol.toLowerCase() === tokenSymbol.toLowerCase())) {
        setTokenError("Token symbol already exists.");
        return;
      }
      setTokenError("");
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-background shadow-2xl border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Create Campaign</DialogTitle>
          <DialogDescription>
            Launch your project and bring it to life on VentureHiveX.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex gap-2 my-4">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col gap-2">
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
              <span className={`text-xs font-medium pl-1 ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            </div>
          ))}
        </div>

        <div className="min-h-[400px] relative overflow-hidden px-1">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 py-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="My Awesome Project" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Technology">Technology</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Finance">Finance</option>
                      <option value="Art">Art</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Short Description *</Label>
                  <Input value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="One-liner about the project" />
                </div>
                <div className="space-y-2">
                  <Label>Long Description</Label>
                  <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={longDesc} onChange={e => setLongDesc(e.target.value)} placeholder="Detailed pitch..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thumbnail (Upload) *</Label>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="cursor-pointer file:cursor-pointer"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setThumbnailFile(file);
                          setThumbnail(URL.createObjectURL(file));
                          toast.success("Image selected (Ready for IPFS upload).");
                        }
                      }} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Video URL</Label>
                    <Input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5 py-2">
                <div className="space-y-2">
                  <Label>Goal Amount (ETH) *</Label>
                  <Input type="number" required value={goalAmount} onChange={e => setGoalAmount(e.target.value)} placeholder="100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date & Time (IST) *</Label>
                    <Input type="datetime-local" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date & Time (IST) *</Label>
                    <Input type="datetime-local" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total Token Supply *</Label>
                  <Input type="number" required value={totalTokenSupply} onChange={e => setTotalTokenSupply(e.target.value)} placeholder="1000000" />
                  <p className="text-xs text-muted-foreground mt-2 px-1">
                    Auto-calculated Price Per Token: 
                    <strong className="text-primary ml-1">
                      {(parseFloat(goalAmount || "0") / parseFloat(totalTokenSupply || "1") || 0).toFixed(6)} ETH
                    </strong>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 py-2">
                {tokenError && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">{tokenError}</p>}
                <div className="space-y-2">
                  <Label>Token Name *</Label>
                  <Input value={tokenName} onChange={e => setTokenName(e.target.value)} placeholder="e.g. EcoToken" />
                </div>
                <div className="space-y-2">
                  <Label>Token Symbol *</Label>
                  <Input value={tokenSymbol} onChange={e => setTokenSymbol(e.target.value)} placeholder="e.g. ECO" maxLength={6} className="uppercase" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6 py-2">
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium">
                  ⚠️ Please ensure all details are correct. You cannot edit funding goals, dates, or token details once the campaign is published and deployed as a smart contract.
                </div>
                <div className="bg-muted p-5 rounded-xl border border-border text-sm space-y-4">
                  <h3 className="text-lg font-bold pb-2 border-b border-border/50">Campaign Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div><span className="text-muted-foreground">Title:</span> <span className="font-semibold">{title}</span></div>
                    <div><span className="text-muted-foreground">Category:</span> <span className="font-semibold">{category}</span></div>
                    <div><span className="text-muted-foreground">Goal:</span> <span className="font-semibold">{parseFloat(goalAmount||"0").toLocaleString()} ETH</span></div>
                    <div><span className="text-muted-foreground">Supply:</span> <span className="font-semibold">{parseFloat(totalTokenSupply||"0").toLocaleString()}</span></div>
                    <div><span className="text-muted-foreground">Token:</span> <span className="font-semibold">{tokenName} ({tokenSymbol})</span></div>
                    <div><span className="text-muted-foreground">Price/Token:</span> <span className="font-semibold text-primary">{(parseFloat(goalAmount||"0") / parseFloat(totalTokenSupply||"1") || 0).toFixed(6)} ETH</span></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between pt-4 border-t border-border mt-2">
          <Button variant="outline" onClick={prevStep} disabled={step === 0}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={nextStep} disabled={!title && step === 0}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              Publish Campaign
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
