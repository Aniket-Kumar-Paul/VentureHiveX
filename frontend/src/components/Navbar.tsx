"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { WalletConnectModal } from "./WalletConnectModal";
import { useState } from "react";
import { useMockData } from "@/lib/MockProvider";
import { Moon, Sun, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { SignupModal } from "./modals/SignupModal";

export function Navbar() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const { currentUser, disconnectWallet } = useMockData();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground tracking-tighter">VH</span>
            </div>
            <span className="font-semibold text-lg tracking-tight hidden sm:block">VentureHiveX</span>
          </Link>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {!currentUser.hasCompletedProfile && (
                <Button variant="secondary" size="sm" onClick={() => setIsSignupModalOpen(true)}>
                  Complete Profile
                </Button>
              )}
              <div className="flex items-center gap-3 border border-border px-3 py-1.5 rounded-full bg-muted/50">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold leading-none">{currentUser.name || "Anonymous"}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {currentUser.address.slice(0, 6)}...{currentUser.address.slice(-4)}
                  </span>
                </div>
                <div className="size-6 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <UserIcon className="size-3.5" />
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
    </nav>
  );
}
