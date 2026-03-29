"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ethers } from "ethers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export function WalletConnectModal({ isOpen, onClose, onConnect }: Props) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    setIsConnecting(true);
    setError("");
    
    try {
      if (!(window as any).ethereum) {
        throw new Error("MetaMask is not installed. Please install it to use this app.");
      }
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        const address = accounts[0];
        // TODO: Call backend to verify if user exists. If not, open Signup.
        onConnect(address);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-950/80 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">Connect Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-6">
          <p className="text-sm text-muted-foreground">
            Connect your Web3 wallet to invest in startups, launch your own campaigns, and trade on the secondary market.
          </p>
          
          {error && <p className="text-sm text-destructive">{error}</p>}
          
          <Button 
            size="lg" 
            className="w-full text-base tracking-tight font-medium bg-primary/90 hover:bg-primary shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
