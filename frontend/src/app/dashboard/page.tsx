"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";

const MOCK_INVESTMENTS = [
  { id: "1", token: "NEO", amount: "5,000", date: "2026-03-28", status: "Active", value: "0.25 ETH" },
  { id: "2", token: "AURA", amount: "10,000", date: "2026-03-25", status: "Upcoming", value: "0.1 ETH" },
  { id: "3", token: "VTX", amount: "2,500", date: "2026-03-15", status: "Closed", value: "0.5 ETH" },
];

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Investor Dashboard</h1>
          <p className="text-muted-foreground">Manage your Web3 startup portfolio.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          Launch New Campaign
        </Button>
      </div>

      <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Top Section: Total Invested Widget */}
      <GlassCard className="mb-8 p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/10 to-transparent">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">Total Capital Deployed</h2>
        <div className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary/50">
          0.85 ETH
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Section: Backed Campaigns Grid */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold border-b border-white/5 pb-2">Backed Campaigns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassCard className="p-4 flex flex-col gap-2">
              <div className="h-24 w-full bg-zinc-900 rounded border border-white/5 mb-2"></div>
              <h4 className="font-semibold">NeoTrade Protocol</h4>
              <p className="text-xs text-muted-foreground">0.25 ETH Invested</p>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col gap-2">
              <div className="h-24 w-full bg-zinc-900 rounded border border-white/5 mb-2"></div>
              <h4 className="font-semibold">Aura Network</h4>
              <p className="text-xs text-muted-foreground">0.1 ETH Invested</p>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col gap-2">
              <div className="h-24 w-full bg-zinc-900 rounded border border-white/5 mb-2"></div>
              <h4 className="font-semibold">Vertex Solutions</h4>
              <p className="text-xs text-muted-foreground">0.5 ETH Invested</p>
            </GlassCard>
          </div>
        </div>

        {/* Right Section: My Investments Ledger */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold border-b border-white/5 pb-2">My Investments</h3>
          <GlassCard className="overflow-hidden">
            <Table>
              <TableHeader className="bg-black/20 hover:bg-black/20">
                <TableRow className="border-white/5">
                  <TableHead className="text-xs uppercase text-muted-foreground">Asset</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground text-right">Value (ETH)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_INVESTMENTS.map((inv) => (
                  <TableRow key={inv.id} className="border-white/5 hover:bg-white/[0.02]">
                    <TableCell className="font-semibold text-primary">{inv.token}</TableCell>
                    <TableCell>{inv.amount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{inv.date}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded border ${inv.status === 'Active' ? 'border-primary/50 text-primary bg-primary/10' : 'border-white/20 text-muted-foreground'}`}>
                        {inv.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{inv.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
