"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { WalletConnectModal } from "./WalletConnectModal";
import { useState } from "react";
import { useMockData } from "@/lib/MockProvider";
import { User as UserIcon } from "lucide-react";
import { SignupModal } from "./modals/SignupModal";
import { ProfileModal } from "./modals/ProfileModal";
import { Logo } from "./Logo";

export function Navbar() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const { currentUser, disconnectWallet } = useMockData();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="flex gap-4">
            <Link href="/campaigns" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Campaigns
            </Link>
            {currentUser && (
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {!currentUser.hasCompletedProfile && (
                <Button variant="secondary" size="sm" onClick={() => setIsSignupModalOpen(true)}>
                  Complete Profile
                </Button>
              )}
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-3 border border-border px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold leading-none">{currentUser.name || "Anonymous"}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {currentUser.address.slice(0, 6)}...{currentUser.address.slice(-4)}
                  </span>
                </div>
                <div className="size-6 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <UserIcon className="size-3.5" />
                </div>
              </button>
              <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsWalletModalOpen(true)} className="shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all hover:scale-105 active:scale-95">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <WalletConnectModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />

      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </nav>
  );
}
