"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppProvider";
import { CampaignCard } from "@/components/CampaignCard";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { RefreshCcw } from "lucide-react";

export default function CampaignsPage() {
  const { campaigns } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Recent");
  const [syncStatus, setSyncStatus] = useState<{ lastSyncTime: string | null; intervalMinutes: number } | null>(null);

  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${url}/campaigns/sync-status`);
        if (res.ok) {
          const data = await res.json();
          setSyncStatus(data);
        }
      } catch (error) {
        console.error("Failed to fetch sync status:", error);
      }
    };
    fetchSyncStatus();
  }, []);

  const filtered = campaigns
    .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.category.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => statusFilter === "All" || c.status === statusFilter)
    .sort((a, b) => {
      if (sortOrder === "Recent") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      if (sortOrder === "Price (Low to High)") return a.pricePerToken - b.pricePerToken;
      if (sortOrder === "Price (High to Low)") return b.pricePerToken - a.pricePerToken;
      return 0;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 md:flex-row md:items-center justify-between mb-10"
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Active Campaigns</h1>
          <p className="text-muted-foreground mt-2">Discover and invest in the next big thing.</p>
          
          {syncStatus && (
            <div className="flex items-center text-xs text-muted-foreground mt-4 gap-1.5 font-medium bg-muted/50 w-fit px-3 py-1.5 rounded-full border border-border/50">
              <RefreshCcw className="w-3.5 h-3.5 animate-in spin-in" />
              <span>
                Status synced {syncStatus.lastSyncTime ? `${formatDistanceToNow(new Date(syncStatus.lastSyncTime))} ago` : 'recently'} 
                <span className="opacity-70 ml-1">(Updates every {syncStatus.intervalMinutes} mins)</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Input 
            placeholder="Search campaigns..." 
            className="w-[200px] h-10" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Active">Active</option>
            <option value="Funded">Funded</option>
            <option value="Failed">Failed</option>
          </select>

          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="Recent">Most Recent</option>
            <option value="Price (Low to High)">Price (Low to High)</option>
            <option value="Price (High to Low)">Price (High to Low)</option>
          </select>
        </div>
      </motion.div>

      {filtered.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((campaign, i) => (
            <motion.div 
              key={campaign.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 * i }}
            >
              <CampaignCard campaign={campaign} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No campaigns found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
