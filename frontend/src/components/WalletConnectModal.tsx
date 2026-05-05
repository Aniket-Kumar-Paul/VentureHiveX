"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useApp } from "@/lib/AppProvider";
import { mockUsers } from "@/lib/mockData";
import { Wallet } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: Props) {
  const { connectMockWallet, connectMetamask } = useApp();
  const [customAddress, setCustomAddress] = useState("");

  const handleMockConnect = (address: string) => {
    connectMockWallet(address);
    onClose();
  };

  const handleMetamaskConnect = async () => {
    await connectMetamask();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-background shadow-2xl border-border p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Left Side: Real Web3 Connection */}
          <div className="p-8 md:w-1/2 flex flex-col items-center justify-center bg-card/50 relative border-b md:border-b-0 md:border-r border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <div className="relative z-10 w-full text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Web3</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Connect your Metamask wallet to interact with real smart contracts, invest, and create campaigns on-chain.
              </p>
              <Button 
                onClick={handleMetamaskConnect}
                size="lg"
                className="w-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-[1.02] transition-transform font-bold"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" className="w-5 h-5 mr-2" alt="Metamask" />
                Connect Metamask
              </Button>
            </div>
          </div>

          {/* Right Side: Demo Mock Data */}
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-semibold tracking-tight text-left">Try Demo Mode</DialogTitle>
              <p className="text-sm text-muted-foreground text-left mt-2">
                Don't have a wallet? Use our mock data to test the platform.
              </p>
            </DialogHeader>
            
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleMockConnect(mockUsers[0].address)}
              >
                <span>Mock Investor ({mockUsers[0].address.slice(0,6)}...)</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Investor</span>
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleMockConnect(mockUsers[1].address)} // The business user
              >
                <span>Mock Business ({mockUsers[1].address.slice(0,6)}...)</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Business</span>
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or custom address</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input 
                placeholder="0xNewCustomAddress..." 
                value={customAddress} 
                onChange={(e) => setCustomAddress(e.target.value)} 
              />
              <Button variant="secondary" onClick={() => handleMockConnect(customAddress || "0xRandom123")}>
                Go
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
