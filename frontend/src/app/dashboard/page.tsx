"use client";

import { useApp } from "@/lib/AppProvider";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

export default function DashboardPage() {
  const { currentUser, campaigns, investments } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"investments" | "transactions" | "charts">("investments");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [txnSortConfig, setTxnSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [txnStatusFilter, setTxnStatusFilter] = useState("All");
  const [txnOperationFilter, setTxnOperationFilter] = useState("All");

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (txnSortConfig && txnSortConfig.key === key && txnSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setTxnSortConfig({ key, direction });
  };

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

  const pieData = investmentSummary.map(item => ({
    name: item.campaign.title,
    value: item.totalInvested
  }));

  const cumulativeData = [...myInvestments]
    .sort((a, b) => new Date(a.dateInvested).getTime() - new Date(b.dateInvested).getTime())
    .reduce((acc, curr) => {
      const prevTotal = acc.length > 0 ? acc[acc.length - 1].total : 0;
      const d = new Date(curr.dateInvested);
      const newTotal = prevTotal + curr.amountInvested;
      acc.push({
        id: curr.id || Math.random().toString(),
        timestamp: d.getTime(),
        fullDate: d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
        total: Number(newTotal.toFixed(6))
      });
      return acc;
    }, [] as { id: string, timestamp: number, fullDate: string, total: number }[]);

  const filteredSummary = investmentSummary.filter(i => categoryFilter === "All" || i.campaign.category === categoryFilter);

  let processedTransactions = [...myInvestments].map(inv => {
    const c = campaigns.find(x => x.id === inv.campaignId);
    return { ...inv, campaign: c };
  }).filter(item => item.campaign !== undefined);

  if (txnStatusFilter !== "All") {
    processedTransactions = processedTransactions.filter(item => item.campaign!.status === txnStatusFilter);
  }

  if (txnOperationFilter !== "All") {
    processedTransactions = processedTransactions.filter(item => (item.type || "INVEST") === txnOperationFilter);
  }

  if (txnSortConfig !== null) {
    processedTransactions.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      switch (txnSortConfig.key) {
        case "campaign": aValue = a.campaign!.title.toLowerCase(); bValue = b.campaign!.title.toLowerCase(); break;
        case "token": aValue = a.campaign!.tokenSymbol.toLowerCase(); bValue = b.campaign!.tokenSymbol.toLowerCase(); break;
        case "tokensReceived": aValue = a.tokensReceived; bValue = b.tokensReceived; break;
        case "amountInvested": aValue = a.amountInvested; bValue = b.amountInvested; break;
        case "dateInvested": aValue = new Date(a.dateInvested).getTime(); bValue = new Date(b.dateInvested).getTime(); break;
        case "operation": aValue = (a.type || "INVEST").toLowerCase(); bValue = (b.type || "INVEST").toLowerCase(); break;
        case "status": aValue = a.campaign!.status.toLowerCase(); bValue = b.campaign!.status.toLowerCase(); break;
        default: return 0;
      }
      if (aValue < bValue) return txnSortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return txnSortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

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
          <div className="bg-gradient-to-br from-primary/30 to-purple-500/20 border border-white/20 p-8 rounded-3xl relative overflow-hidden backdrop-blur-2xl shadow-xl ring-1 ring-white/10">
            <div className="relative z-10 flex flex-col gap-2">
              <h2 className="text-lg font-medium text-muted-foreground">Total Portfolio Value (Invested)</h2>
              <div className="text-5xl font-bold tracking-tighter text-foreground">{totalAmountInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ETH</div>
            </div>
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex gap-2 p-1.5 bg-muted/30 backdrop-blur-lg rounded-xl border border-white/10 shadow-md ring-1 ring-white/5 w-fit">
            <button onClick={() => setActiveTab("investments")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === "investments" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Investments</button>
            <button onClick={() => setActiveTab("transactions")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === "transactions" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Transactions</button>
            <button onClick={() => setActiveTab("charts")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === "charts" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Charts</button>
          </div>

          {activeTab === "investments" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4">
                <h2 className="text-2xl font-bold tracking-tight">My Investments Summary</h2>
                <select 
                  className="h-10 mt-2 sm:mt-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {Array.from(new Set(investmentSummary.map(i => i.campaign.category))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {filteredSummary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSummary.map((item, i) => (
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4">
                <h2 className="text-2xl font-bold tracking-tight">All Transactions</h2>
                <div className="flex flex-wrap items-center gap-4 mt-4 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Operation:</span>
                    <select 
                      value={txnOperationFilter} 
                      onChange={(e) => setTxnOperationFilter(e.target.value)}
                      className="bg-card border border-border text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 backdrop-blur-md transition-colors"
                    >
                      <option value="All">All</option>
                      {Array.from(new Set(myInvestments.map(i => i.type || "INVEST"))).map(type => (
                        <option key={type} value={type as string}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <select 
                      value={txnStatusFilter} 
                      onChange={(e) => setTxnStatusFilter(e.target.value)}
                      className="bg-card border border-border text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 backdrop-blur-md transition-colors"
                    >
                      <option value="All">All</option>
                      {Array.from(new Set(myInvestments.map(i => campaigns.find(c => c.id === i.campaignId)?.status).filter(Boolean))).map(status => (
                        <option key={status} value={status as string}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {processedTransactions.length > 0 ? (
                <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 backdrop-blur-md border-b border-white/10 uppercase text-muted-foreground text-xs shadow-sm ring-1 ring-white/5 select-none">
                    <tr>
                      <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('campaign')}>
                        Campaign {txnSortConfig?.key === 'campaign' ? (txnSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </th>
                      <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('token')}>
                        Token {txnSortConfig?.key === 'token' ? (txnSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </th>
                      <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('tokensReceived')}>
                        Tokens Received {txnSortConfig?.key === 'tokensReceived' ? (txnSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </th>
                      <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('amountInvested')}>
                        Amount ETH {txnSortConfig?.key === 'amountInvested' ? (txnSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </th>
                      <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('dateInvested')}>
                        Date {txnSortConfig?.key === 'dateInvested' ? (txnSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </th>
                      <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('operation')}>
                        Operation {txnSortConfig?.key === 'operation' ? (txnSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </th>
                      <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('status')}>
                        Status {txnSortConfig?.key === 'status' ? (txnSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {processedTransactions.map((item) => {
                      const c = item.campaign!;
                      return (
                        <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 font-medium text-primary hover:underline">
                            <Link href={`/campaigns/${c.id}`}>{c.title}</Link>
                          </td>
                          <td className="px-6 py-4 font-semibold">{c.tokenSymbol}</td>
                          <td className="px-6 py-4">{item.tokensReceived.toLocaleString()}</td>
                          <td className="px-6 py-4 font-medium">{item.amountInvested.toLocaleString()} ETH</td>
                          <td className="px-6 py-4 text-muted-foreground">{new Date(item.dateInvested).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              (item.type || 'INVEST') === 'INVEST' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                            }`}>
                              {item.type || "INVEST"}
                            </span>
                          </td>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Allocation Pie Chart */}
                  <div className="h-[400px] w-full bg-card/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl ring-1 ring-white/5 flex flex-col items-center">
                    <h3 className="font-semibold text-lg mb-4 text-center">Investment Allocation</h3>
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name} outerRadius={100} fill="#8884d8" dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }} itemStyle={{ color: 'var(--foreground)' }} formatter={(value: any) => `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Growth Line Chart */}
                  <div className="h-[400px] w-full bg-card/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl ring-1 ring-white/5 flex flex-col items-center">
                    <h3 className="font-semibold text-lg mb-4 text-center">Cumulative Portfolio Value</h3>
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <LineChart data={cumulativeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis tick={false} dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} />
                        <YAxis domain={['auto', 'auto']} padding={{ top: 20 }} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ETH`} />
                        <Tooltip labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || new Date(label).toLocaleString()} contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }} itemStyle={{ color: 'var(--foreground)' }} />
                        <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

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
