"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMockData } from "@/lib/MockProvider";
import { Logo } from "@/components/Logo";

export default function LandingPage() {
  const { currentUser } = useMockData();
  const isInvestor = currentUser?.role === "Investor";
  const actionText = isInvestor ? "Invest in projects" : "Launch a Project";
  const actionLink = isInvestor ? "/campaigns" : "/dashboard";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="container px-4 md:px-6 mb-24">
        <div className="flex flex-col items-center justify-center space-y-12 text-center mt-20">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4 max-w-3xl"
          >
            <h1 className="text-4xl font-extrabold pb-2 tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-[linear-gradient(to_right,#8b5cf6,#ec4899,#9924d6,#8b5cf6)] bg-[length:200%_auto] animate-gradient-x">
              Fund the Future with VentureHiveX
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              The premier web3 platform where bleeding-edge startups meet visionary investors. Tokenize your equity and raise capital with absolute transparency.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-sm flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/campaigns" className="w-full sm:w-auto flex justify-center">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 border border-transparent text-base shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] transition-all flex items-center justify-center">
                Explore Campaigns
              </Button>
            </Link>
            <Link href={actionLink} className="w-full sm:w-auto flex justify-center">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base border-primary/20 hover:bg-primary/10 flex items-center justify-center">
                {actionText}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-24 grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto"
        >
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center space-y-3 text-center p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                {feature.icon}
              </div>
              <h2 className="text-xl font-bold">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* How it works section */}
      <section className="w-full py-20 bg-muted/30 border-y border-border backdrop-blur-sm">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">How VentureHiveX Works</h2>
            <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">A streamlined, transparent process bringing founders and investors together on-chain.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border/80 z-0"></div>
            
            {[
              { step: "1", title: "Create Profile", desc: "Register as a Business to launch or Investor to fund." },
              { step: "2", title: "Launch / Browse", desc: "Startups configure tokennomics; investors explore pitches." },
              { step: "3", title: "Fund via Smart Contract", desc: "Invest ETH securely. Funds held in escrow until goal is hit." },
              { step: "4", title: "Claim & Trade Tokens", desc: "Receive & trade campaign tokens upon successful raise." }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 bg-background border-t border-border mt-auto">
        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center justify-center space-y-4 text-center">
          <Logo className="mb-2 opacity-80" iconSize={24} textSize="text-xl" />
          <p className="text-sm text-muted-foreground max-w-xl">
            Empowering the next generation of decentralized businesses through trustless tokenized crowdfunding.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground pt-4">
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Docs</Link>
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
          </div>
          <p className="text-xs text-muted-foreground mt-8 opacity-60">© {new Date().getFullYear()} VentureHiveX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Instant Tokenization",
    desc: "Automatically emit fractional ownership tokens representing your venture equity to global investors.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
  },
  {
    title: "Transparent Capital",
    desc: "Smart contracts ensure funds are kept secure. Investors can claim refunds if goals aren't met.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
  },
  {
    title: "Secondary Markets",
    desc: "Trade your tokens on our own integrated secondary DEX seamlessly once the campaign completes.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  }
];
