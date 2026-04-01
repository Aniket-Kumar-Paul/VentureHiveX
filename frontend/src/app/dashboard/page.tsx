"use client";

import { useMockData } from "@/lib/MockProvider";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const { currentUser, campaigns, investments } = useMockData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">Please connect your wallet first</h2>
      </div>
    );
  }

  const isBusiness = currentUser.role === "Business";
  const myCampaigns = campaigns.filter(c => c.creatorAddress === currentUser.address);
  
  const myInvestments = investments.filter(inv => inv.investorAddress === currentUser.address);
  const investedCampaignIds = Array.from(new Set(myInvestments.map(i => i.campaignId)));
  const investedCampaigns = campaigns.filter(c => investedCampaignIds.includes(c.id));
  const totalAmountInvested = myInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome Back, {currentUser.name}!</h1>
        <p className="text-muted-foreground text-lg">
          {isBusiness ? "Manage your fundraising campaigns." : "Track your startup investments."}
        </p>
      </motion.div>

      {isBusiness ? (
        // BUSINESS DASHBOARD
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">My Campaigns</h2>
              <p className="text-muted-foreground text-sm mt-1">You have created {myCampaigns.length} campaigns.</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              Create New Campaign
            </Button>
          </div>

          {myCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myCampaigns.map((campaign, i) => (
                <motion.div key={campaign.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <CampaignCard campaign={campaign} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-muted/20">
              <p className="text-muted-foreground">You haven't created any campaigns yet.</p>
            </div>
          )}

          <CreateCampaignModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
      ) : (
        // INVESTOR DASHBOARD
        <div className="flex flex-col gap-10">
          <div className="bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20 p-8 rounded-3xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-2">
              <h2 className="text-lg font-medium text-muted-foreground">Total Portfolio Value (Invested)</h2>
              <div className="text-5xl font-bold tracking-tighter text-foreground">${totalAmountInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight border-b border-border pb-4">My Investments</h2>
            {myInvestments.length > 0 ? (
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border uppercase text-muted-foreground text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Campaign</th>
                      <th className="px-6 py-4 font-semibold">Token</th>
                      <th className="px-6 py-4 font-semibold">Tokens Received</th>
                      <th className="px-6 py-4 font-semibold">Amount USD</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {myInvestments.map((inv) => {
                      const c = campaigns.find(x => x.id === inv.campaignId);
                      if (!c) return null;
                      return (
                        <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 font-medium text-primary hover:underline">
                            <Link href={`/campaigns/${c.id}`}>{c.title}</Link>
                          </td>
                          <td className="px-6 py-4 font-semibold">{c.tokenSymbol}</td>
                          <td className="px-6 py-4">{inv.tokensReceived.toLocaleString()}</td>
                          <td className="px-6 py-4 font-medium">${inv.amountInvested.toLocaleString()}</td>
                          <td className="px-6 py-4 text-muted-foreground">{new Date(inv.dateInvested).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-semibold">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No investments found.</p>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Invested Campaigns</h2>
            {investedCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {investedCampaigns.map((campaign, i) => (
                  <motion.div key={`card-${campaign.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <CampaignCard campaign={campaign} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
                <p className="text-muted-foreground">You haven't invested in any campaigns yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
