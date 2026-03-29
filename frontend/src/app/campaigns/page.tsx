"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

const MOCK_CAMPAIGNS = [
  { id: "1", title: "NeoTrade Protocol", shortDesc: "Decentralized dark pool trading for institutional DeFi.", status: "Active", price: "0.05 ETH", raised: "45 ETH", goal: "100 ETH" },
  { id: "2", title: "Aura Network", shortDesc: "Zero-knowledge privacy layer for everyday dApps.", status: "Upcoming", price: "0.01 ETH", raised: "0 ETH", goal: "50 ETH" },
  { id: "3", title: "Vertex Solutions", shortDesc: "Enterprise supply chain on the Sepolia testnet.", status: "Active", price: "0.1 ETH", raised: "120 ETH", goal: "200 ETH" },
];

export default function CampaignsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Discover Startups</h1>
          <p className="text-muted-foreground">Invest in the next generation of Web3 businesses.</p>
        </div>
        
        <div className="flex gap-3">
          <select className="bg-zinc-950/50 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Upcoming</option>
            <option>Closed</option>
          </select>
          <select className="bg-zinc-950/50 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
            <option>Sort: Recent</option>
            <option>Sort: Token Price</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CAMPAIGNS.map(campaign => (
          <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="block group">
            <GlassCard className="h-full transition-transform hover:-translate-y-1 hover:shadow-[0_10px_40px_-15px_rgba(124,58,237,0.3)]">
              {/* Thumbnail Placeholder */}
              <div className="w-full h-48 bg-zinc-900 border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{campaign.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded border ${campaign.status === 'Active' ? 'border-primary/50 text-primary bg-primary/10' : 'border-white/20 text-muted-foreground'}`}>
                    {campaign.status}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">{campaign.shortDesc}</p>
                
                <div className="pt-4 border-t border-white/5 mt-auto flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Token Price</p>
                    <p className="font-medium text-sm">{campaign.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Raised</p>
                    <p className="font-medium text-sm text-primary">{campaign.raised} <span className="text-muted-foreground">/ {campaign.goal}</span></p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
