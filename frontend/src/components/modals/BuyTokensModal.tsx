"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMockData } from "@/lib/MockProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

export function BuyTokensModal({ isOpen, onClose, campaignId }: Props) {
  const { currentUser, campaigns, investInCampaign } = useMockData();
  const [tokenAmount, setTokenAmount] = useState("");
  
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) return null;

  const numTokens = parseFloat(tokenAmount) || 0;
  const totalPrice = numTokens * campaign.pricePerToken;

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPrice <= 0) return;
    investInCampaign(campaignId, totalPrice);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background shadow-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Invest in {campaign.title}</DialogTitle>
        </DialogHeader>
        
        {currentUser && !currentUser.hasCompletedProfile ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-muted-foreground font-medium">You must complete your profile before investing in campaigns.</p>
            <Button onClick={onClose} variant="outline" className="mt-2">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleInvest} className="flex flex-col gap-6 py-4">
            <div className="space-y-2 bg-muted/50 p-4 rounded-xl border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Token Price</span>
              <span className="font-semibold">{campaign.pricePerToken.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Token Symbol</span>
              <span className="font-semibold">{campaign.tokenSymbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available Tokens</span>
              <span className="font-semibold">
                {(campaign.totalTokenSupply - (campaign.amountRaised / campaign.pricePerToken)).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokens">Amount of Tokens to Buy</Label>
              <div className="relative">
                <Input 
                  id="tokens" 
                  type="number" 
                  min="1"
                  step="1"
                  required 
                  className="pr-16 text-lg py-6 font-medium"
                  value={tokenAmount} 
                  onChange={e => setTokenAmount(e.target.value)} 
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  {campaign.tokenSymbol}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <span className="font-medium text-primary">Total Price</span>
              <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ETH</span>
            </div>
          </div>
          
            <Button type="submit" size="lg" className="w-full text-lg shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              Confirm Investment
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
