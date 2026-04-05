"use client";

import { useMockData } from "@/lib/MockProvider";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { currentUser, campaigns, investments } = useMockData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"investments" | "transactions" | "charts">("investments");

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">Please connect your wallet first</h2>
      </div>
    );
  }

  if (!currentUser.hasCompletedProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold text-center">Profile Incomplete</h2>
        <p className="text-muted-foreground max-w-md text-center">
          You must complete your profile before accessing the dashboard to ensure compliance and proper role assignment.
        </p>
      </div>
    );
  }

  const isBusiness = currentUser.role === "Business";
  const myCampaigns = campaigns.filter(c => c.creatorAddress === currentUser.address);
  
  const myInvestments = investments.filter(inv => inv.investorAddress === currentUser.address);
  const investedCampaignIds = Array.from(new Set(myInvestments.map(i => i.campaignId)));
  const investedCampaigns = campaigns.filter(c => investedCampaignIds.includes(c.id));
  const totalAmountInvested = myInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0);

  const investmentSummary = investedCampaigns.map(c => {
    const campaignInvestments = myInvestments.filter(i => i.campaignId === c.id);
    const totalInvestedInCampaign = campaignInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0);
    const totalTokensReceived = campaignInvestments.reduce((sum, inv) => sum + inv.tokensReceived, 0);
    return { campaign: c, totalInvested: totalInvestedInCampaign, totalTokens: totalTokensReceived };
  });

  const chartData = myInvestments.map(inv => {
    const c = campaigns.find(x => x.id === inv.campaignId);
    return {
      name: c?.tokenSymbol || "Unknown",
      amount: inv.amountInvested,
      date: new Date(inv.dateInvested).toLocaleDateString()
    };
  });

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
              <div className="text-5xl font-bold tracking-tighter text-foreground">{totalAmountInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH</div>
            </div>
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex gap-2 p-1 bg-muted/40 rounded-xl border border-border w-fit">
            <button onClick={() => setActiveTab("investments")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === "investments" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Investments</button>
            <button onClick={() => setActiveTab("transactions")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === "transactions" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Transactions</button>
            <button onClick={() => setActiveTab("charts")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === "charts" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Charts</button>
          </div>

          {activeTab === "investments" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold tracking-tight border-b border-border pb-4">My Investments Summary</h2>
              {investmentSummary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {investmentSummary.map((item, i) => (
                    <Link key={item.campaign.id} href={`/campaigns/${item.campaign.id}`} className="block group">
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-4 shadow-sm group-hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] group-hover:border-primary/50 transition-all h-full">
                    <h3 className="font-bold text-lg line-clamp-1">{item.campaign.title}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Invested</span>
                      <span className="font-semibold">{item.totalInvested.toLocaleString()} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tokens Received</span>
                      <span className="font-semibold">{item.totalTokens.toLocaleString()} {item.campaign.tokenSymbol}</span>
                    </div>
                  </motion.div>
                </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No investments found.</p>
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold tracking-tight border-b border-border pb-4">All Transactions</h2>
              {myInvestments.length > 0 ? (
                <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border uppercase text-muted-foreground text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Campaign</th>
                      <th className="px-6 py-4 font-semibold">Token</th>
                      <th className="px-6 py-4 font-semibold">Tokens Received</th>
                      <th className="px-6 py-4 font-semibold">Amount ETH</th>
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
                          <td className="px-6 py-4 font-medium">{inv.amountInvested.toLocaleString()} ETH</td>
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
              <p className="text-muted-foreground">No transactions found.</p>
            )}
            </div>
          )}

          {activeTab === "charts" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold tracking-tight border-b border-border pb-4">Portfolio Analytics</h2>
              {myInvestments.length > 0 ? (
                <div className="h-[400px] w-full bg-card/50 rounded-2xl border border-border p-6 shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ETH`} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderRadius: '8px', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                      <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available for charts.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
