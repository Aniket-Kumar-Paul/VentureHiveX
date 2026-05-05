"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { WalletConnectModal } from "./WalletConnectModal";
import { useState } from "react";
import { useApp } from "@/lib/AppProvider";
import { User as UserIcon } from "lucide-react";
import { SignupModal } from "./modals/SignupModal";
import { ProfileModal } from "./modals/ProfileModal";
import { Logo } from "./Logo";

export function Navbar() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const { currentUser, disconnectWallet } = useApp();

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
              <div
                className="group relative flex items-center justify-center p-2 rounded-full border border-border bg-muted/50 hover:bg-primary/20 hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <div className="flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
                  <UserIcon className="size-5" />
                </div>
                <div className="absolute right-0 top-12 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 bg-card border border-border rounded-xl shadow-2xl p-4 w-48 z-50 flex flex-col gap-1 cursor-default" onClick={e => e.stopPropagation()}>
                  <span className="text-sm font-bold truncate">{currentUser.name || "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground truncate">{currentUser.email || "No Email"}</span>
                  <span className="text-[10px] text-muted-foreground mt-2 bg-muted px-2 py-1 rounded inline-block w-fit">
                    {currentUser.address.slice(0, 6)}...{currentUser.address.slice(-4)}
                  </span>
                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setIsProfileModalOpen(true)}>Edit Profile</Button>
                </div>
              </div>
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
