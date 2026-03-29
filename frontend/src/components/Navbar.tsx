"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { WalletConnectModal } from "./WalletConnectModal";
import { useState } from "react";

export function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // We'll replace this with real global state later
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");

  const handleConnect = () => {
    setIsModalOpen(true);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="size-8 rounded bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground tracking-tighter">VH</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">VentureHiveX</span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/campaigns" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Campaigns
            </Link>
            {isConnected && (
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground border border-white/10 px-3 py-1.5 rounded-full bg-black/20">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <Button variant="ghost" size="sm" onClick={() => { setIsConnected(false); setAddress(""); }}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnect} className="shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <WalletConnectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConnect={(addr) => {
          setAddress(addr);
          setIsConnected(true);
        }}
      />
    </nav>
  );
}
