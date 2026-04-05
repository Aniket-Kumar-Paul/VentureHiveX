"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMockData } from "@/lib/MockProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SignupModal({ isOpen, onClose }: Props) {
  const { currentUser, registerUser } = useMockData();
  const [role, setRole] = useState<"Investor" | "Business">("Investor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    registerUser({
      ...currentUser,
      role,
      name,
      email,
      gender,
      dob,
      description,
      companyName: role === "Business" ? companyName : undefined,
      companyUrl: role === "Business" ? companyUrl : undefined,
      hasCompletedProfile: true,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-background shadow-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Complete Profile</DialogTitle>
          <DialogDescription>
            Tell us a bit about yourself to get started on VentureHiveX.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-4">
          <div className="flex gap-4 p-1 bg-muted rounded-lg">
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${role === "Investor" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setRole("Investor")}
            >
              Investor
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${role === "Business" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setRole("Business")}
            >
              Business
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select 
                id="gender" 
                required
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                value={gender} 
                onChange={e => setGender(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input id="dob" type="date" required value={dob} onChange={e => setDob(e.target.value)} />
            </div>
          </div>

          {role === "Business" && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyUrl">Company URL</Label>
                <Input id="companyUrl" type="url" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} placeholder="https://acme.com" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Short Bio / Description</Label>
            <textarea 
              id="description" 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Tell us about your investment goals or your business..."
            />
          </div>
          
          <div className="space-y-4 mt-4">
            <p className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
              ⚠️ Note: Your Role, Gender, and Date of Birth cannot be changed after registration.
            </p>
            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-base tracking-tight font-medium"
            >
              Complete Registration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
