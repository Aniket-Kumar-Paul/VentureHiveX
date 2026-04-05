"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMockData } from "@/lib/MockProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: Props) {
  const { connectWallet, users } = useMockData();
  const [customAddress, setCustomAddress] = useState("");

  const handleMockConnect = (address: string) => {
    connectWallet(address);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background shadow-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">Connect Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-6">
          <p className="text-sm text-muted-foreground">
            For this demo, you can connect using our mock users to test different roles, or enter a custom address.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline"
              className="w-full justify-between"
              onClick={() => handleMockConnect(users[0].address)}
            >
              <span>Mock Investor ({users[0].address.slice(0,6)}...)</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Investor</span>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-between"
              onClick={() => handleMockConnect(users[1].address)} // The business user
            >
              <span>Mock Business ({users[1].address.slice(0,6)}...)</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Business</span>
            </Button>
          </div>

          <div className="relative my-4">
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
            <Button onClick={() => handleMockConnect(customAddress || "0xRandom123")}>
              Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
