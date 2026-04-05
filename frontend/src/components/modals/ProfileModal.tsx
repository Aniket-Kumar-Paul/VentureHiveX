"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useMockData } from "@/lib/MockProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: Props) {
  const { currentUser, updateUser } = useMockData();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setDescription(currentUser.description || "");
      setCompanyName(currentUser.companyName || "");
      setCompanyUrl(currentUser.companyUrl || "");
    }
  }, [currentUser, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    updateUser({
      ...currentUser,
      name,
      email,
      description,
      companyName: currentUser.role === "Business" ? companyName : undefined,
      companyUrl: currentUser.role === "Business" ? companyUrl : undefined,
    });
    
    onClose();
  };

  if (!currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input id="edit-name" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input id="edit-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {currentUser.role === "Business" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-companyName">Company Name *</Label>
                <Input id="edit-companyName" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-companyUrl">Company URL</Label>
                <Input id="edit-companyUrl" type="url" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-description">Short Bio / Description</Label>
            <textarea 
              id="edit-description" 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>
          
          <Button type="submit" className="mt-2 text-base font-medium">
            Save Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
