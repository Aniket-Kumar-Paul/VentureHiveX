"use client";

import { useApp } from "@/lib/AppProvider";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { BuyTokensModal } from "@/components/modals/BuyTokensModal";
import { EditCampaignModal } from "@/components/modals/EditCampaignModal";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SingleCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { campaigns, currentUser, refundCampaign, withdrawFunds, investments } = useApp();
  const id = params?.id as string;
  const campaign = campaigns.find((c) => c.id === id);

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (campaign && campaign.status?.toUpperCase() === "UPCOMING") {
      const interval = setInterval(() => {
        const diff = new Date(campaign.startDate).getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft("Started!");
          clearInterval(interval);
        } else {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / 1000 / 60) % 60);
          setTimeLeft(`${d}d ${h}h ${m}m`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [campaign]);

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">Campaign not found</h2>
        <Button variant="link" onClick={() => router.push("/campaigns")}>Go back to campaigns</Button>
      </div>
    );
  }

  const progress = Math.min(100, Math.round((campaign.amountRaised / campaign.goalAmount) * 100));
  const isCreator = currentUser?.address === campaign.creatorAddress;
  const isInvestor = currentUser?.role === "Investor";

  const handleRefund = () => refundCampaign(campaign.id);
  const handleWithdraw = () => withdrawFunds(campaign.id);
  
  const hasWithdrawn = investments.some(inv => inv.campaignId === campaign.id && inv.type === 'WITHDRAW');

  const myCampaignInvestments = investments.filter(inv => inv.campaignId === campaign.id && inv.investorAddress === currentUser?.address);
  const myNetInvested = myCampaignInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0);
  const myNetTokens = myCampaignInvestments.reduce((sum, inv) => sum + inv.tokensReceived, 0);
  const hasRefunded = myCampaignInvestments.some(inv => inv.type === 'REFUND');

  return (
    <div className="container mx-auto px-4 py-8 pt-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Section (Smaller): Stats and Actions */}
        <div className="w-full lg:w-1/3 order-2 lg:order-1 flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Investment Goal</h3>
            <div className="text-4xl font-extrabold tracking-tight">{campaign.goalAmount.toLocaleString()} ETH</div>
            
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-primary">{campaign.amountRaised.toLocaleString()} ETH Raised</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full bg-primary bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-8 space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Start Date & Time</span>
                <span className="font-semibold">{new Date(campaign.startDate).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })} (IST)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">End Date & Time</span>
                <span className="font-semibold">{new Date(campaign.endDate).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })} (IST)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Token Symbol</span>
                <span className="font-semibold cursor-help" title={campaign.tokenName}>{campaign.tokenSymbol}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Price Per Token</span>
                <span className="font-semibold text-primary">{campaign.pricePerToken.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold">{campaign.status}</span>
              </div>
            </div>

            {/* INVESTOR STATS */}
            {isInvestor && myNetInvested > 0 && (
              <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
                <h4 className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">Your Investment</h4>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted-foreground text-sm">Amount Invested</span>
                  <span className="font-bold">{myNetInvested.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Tokens Owned</span>
                  <span className="font-bold">{myNetTokens.toLocaleString(undefined, { maximumFractionDigits: 4 })} {campaign.tokenSymbol}</span>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-8">
              {!currentUser ? (
                <div className="p-4 bg-muted/50 rounded-xl text-center text-sm border border-border">
                  Connect your wallet to participate.
                </div>
              ) : isInvestor ? (
                <div className="flex flex-col gap-3">
                  {campaign.status?.toUpperCase() === "UPCOMING" && (
                    <Button disabled className="w-full" size="lg">Starts in: {timeLeft}</Button>
                  )}
                  {campaign.status?.toUpperCase() === "ACTIVE" && (
                    <Button onClick={() => setIsBuyModalOpen(true)} className="w-full shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:scale-[1.02] transition-transform" size="lg">
                      Buy Tokens
                    </Button>
                  )}
                  {campaign.status?.toUpperCase() === "FUNDED" && (
                    <div className="text-center p-3 animate-pulse text-green-500 font-bold border border-green-500/20 bg-green-500/10 rounded-xl">
                      🎉 Fully Funded!
                    </div>
                  )}
                  {campaign.status?.toUpperCase() === "FAILED" && (
                    myNetInvested > 0 ? (
                      <Button onClick={handleRefund} className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
                        Refund Tokens
                      </Button>
                    ) : hasRefunded ? (
                      <div className="text-center p-3 text-green-500 font-bold border border-green-500/20 bg-green-500/10 rounded-xl">
                        Tokens Successfully Refunded
                      </div>
                    ) : null
                  )}
                </div>
              ) : isCreator ? (
                <div className="flex flex-col gap-3">
                  {campaign.status?.toUpperCase() === "UPCOMING" && (
                    <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="w-full" size="lg">Edit Campaign</Button>
                  )}
                  {campaign.status?.toUpperCase() === "ACTIVE" && (
                    <div className="text-center p-3 text-primary font-bold border border-primary/20 bg-primary/10 rounded-xl">
                      Campaign is currently active.
                    </div>
                  )}
                  {campaign.status?.toUpperCase() === "FUNDED" && (
                    hasWithdrawn ? (
                      <div className="text-center p-3 text-green-500 font-bold border border-green-500/20 bg-green-500/10 rounded-xl">
                        Funds Successfully Withdrawn
                      </div>
                    ) : (
                      <Button onClick={handleWithdraw} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                        Withdraw Funds
                      </Button>
                    )
                  )}
                  {campaign.status?.toUpperCase() === "FAILED" && (
                    <div className="text-center p-3 text-red-500 font-bold border border-red-500/20 bg-red-500/10 rounded-xl">
                      Campaign failed to reach goal.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-3 text-muted-foreground font-medium border border-border bg-muted/30 rounded-xl">
                  You are viewing as a Business account. (Not Creator)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section (Bigger): Details */}
        <div className="w-full lg:w-2/3 order-1 lg:order-2 flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
                {campaign.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">{campaign.title}</h1>
            {campaign.companyName && (
              <div className="text-lg font-medium text-muted-foreground flex items-center gap-2 mb-4">
                by <span className="text-primary font-bold">{campaign.companyName}</span>
              </div>
            )}
            <p className="text-xl text-muted-foreground leading-relaxed">
              {campaign.shortDescription}
            </p>
          </div>

          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/80 border border-border relative flex items-center justify-center group shadow-2xl">
            {campaign.videoUrl && campaign.videoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/) && campaign.videoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2].length === 11 ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${campaign.videoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2]}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="w-full h-full relative">
                {campaign.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="size-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(124,58,237,0.6)]">
                      <div className="ml-1 w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent"></div>
                    </div>
                  </div>
                )}
                <img 
                  src={campaign.thumbnailUrl} 
                  alt={campaign.title} 
                  className={`w-full h-full object-cover ${campaign.videoUrl ? 'opacity-50 group-hover:scale-105 transition-transform duration-700' : ''}`}
                />
              </div>
            )}
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold border-b border-border pb-2 mb-4">About this project</h2>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{campaign.longDescription}</p>
          </div>
          
          {campaign.website && (
            <div className="flex items-center gap-2 mt-4 text-primary hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <a href={campaign.website.startsWith('http') ? campaign.website : `https://${campaign.website}`} target="_blank" rel="noopener noreferrer">{campaign.website}</a>
            </div>
          )}
        </div>

      </motion.div>

      {/* Modals */}
      <BuyTokensModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} campaignId={campaign.id} />
      <EditCampaignModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} campaignId={campaign.id} />
    </div>
  );
}
