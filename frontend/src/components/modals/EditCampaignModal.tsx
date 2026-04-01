"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockData } from "@/lib/MockProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

export function EditCampaignModal({ isOpen, onClose, campaignId }: Props) {
  const { campaigns, updateCampaign } = useMockData();
  const campaign = campaigns.find(c => c.id === campaignId);

  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (campaign && isOpen) {
      setTitle(campaign.title);
      setShortDesc(campaign.shortDescription);
      setLongDesc(campaign.longDescription);
      setCategory(campaign.category);
      setThumbnail(campaign.thumbnailUrl);
      setVideoUrl(campaign.videoUrl || "");
      setWebsite(campaign.website);
    }
  }, [campaign, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    
    updateCampaign({
      ...campaign,
      title,
      shortDescription: shortDesc,
      longDescription: longDesc,
      category,
      thumbnailUrl: thumbnail,
      videoUrl,
      website
    });
    
    onClose();
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Edit Campaign</DialogTitle>
          <DialogDescription>
            Update your campaign details. Financial and token rules cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Technology">Technology</option>
                <option value="Gaming">Gaming</option>
                <option value="Finance">Finance</option>
                <option value="Art">Art</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input type="url" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Short Description *</Label>
            <Input required value={shortDesc} onChange={e => setShortDesc(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label>Long Description</Label>
            <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={longDesc} onChange={e => setLongDesc(e.target.value)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input type="url" value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-4 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
