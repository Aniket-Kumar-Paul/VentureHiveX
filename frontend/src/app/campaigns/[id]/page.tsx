"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SingleCampaignPage({ params }: { params: { id: string } }) {
  // Mock data for UI
  const campaign = {
    title: "NeoTrade Protocol",
    category: "DeFi",
    website: "https://neotrade.io",
    longDesc: "A decentralized dark pool protocol aiming to bring institutional privacy algorithms onto the public ledger. By using Zero-Knowledge proofs, NeoTrade allows massive liquidity orders to be executed without causing slippage or front-running.",
    price: "0.05 ETH",
    raised: 45,
    goal: 100,
    supply: "10,000,000 NEO",
    timeline: "Ends in 14 Days",
    tokenSymbol: "NEO"
  };

  const progressPercent = (campaign.raised / campaign.goal) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/campaigns" className="hover:text-foreground transition-colors">Campaigns</Link>
        <span>/</span>
        <span className="text-foreground">{campaign.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Right Side: Main Details (Now on left visually per standard layouts, but doc said RIGHT Side: Title... LEFT Side: Panel. Let's do it exactly as doc asked, or standard left-main right-sidebar) */}
        {/* Per doc: Right side = content, Left side = panel. We'll render content first for mobile, but use flex-row-reverse for desktop to put panel on left? No, standard is Main on Left, Panel on Right. Doc said "RIGHT Side: Campaign Title... LEFT Side: Glassy panel". Okay, I'll put Panel on Left. */}
        
        {/* LEFT SIDE: Investment Panel */}
        <div className="lg:w-1/3 order-2 lg:order-1 flex flex-col gap-6">
          <GlassCard className="p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-4 border-b border-white/5 pb-4">Investment Summary</h3>
            
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-bold text-primary">{campaign.raised} ETH</span>
                <span className="text-sm text-muted-foreground">of {campaign.goal} ETH</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-zinc-900 border border-white/5" />
            </div>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-muted-foreground">Token Price</span>
                <span className="font-medium">{campaign.price}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-muted-foreground">Total Supply</span>
                <span className="font-medium">{campaign.supply}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-muted-foreground">Timeline</span>
                <span className="font-medium text-primary">{campaign.timeline}</span>
              </div>
            </div>

            <Button size="lg" className="w-full text-base font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              Buy Tokens
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">Requires connected MetaMask wallet</p>
          </GlassCard>
        </div>

        {/* RIGHT SIDE: Content */}
        <div className="lg:w-2/3 order-1 lg:order-2 flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{campaign.title}</h1>
          
          <div className="flex gap-4 items-center flex-wrap">
            <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {campaign.category}
            </span>
            <a href={campaign.website} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-white underline underline-offset-4">
              {campaign.website}
            </a>
          </div>

          <div className="w-full aspect-video bg-zinc-900 border border-white/10 rounded-xl overflow-hidden relative flex items-center justify-center">
            {/* Play button generic placeholder */}
            <div className="size-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md cursor-pointer hover:bg-white/20 transition-colors">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1"></div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.2)_0,transparent_50%)] pointer-events-none"></div>
          </div>

          <Tabs defaultValue="story" className="w-full mt-4">
            <TabsList className="bg-zinc-950/50 border border-white/5 p-1">
              <TabsTrigger value="story">Story</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
            </TabsList>
            <TabsContent value="story" className="pt-4 text-muted-foreground leading-relaxed">
              <p>{campaign.longDesc}</p>
              <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </TabsContent>
            <TabsContent value="team" className="pt-4 text-muted-foreground">
              <p>Team information will be loaded from IPFS metadata.</p>
            </TabsContent>
            <TabsContent value="updates" className="pt-4 text-muted-foreground">
              <p>No recent updates posted by the campaign creator.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
