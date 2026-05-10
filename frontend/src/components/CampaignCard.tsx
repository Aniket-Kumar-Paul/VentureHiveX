import { Campaign } from "@/lib/mockData";
import Link from "next/link";
import Image from "next/image";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "bg-green-500/90 text-white border-green-500 shadow-md backdrop-blur-xl";
      case "UPCOMING": return "bg-blue-500/90 text-white border-blue-500 shadow-md backdrop-blur-xl";
      case "FUNDED": return "bg-purple-500/90 text-white border-purple-500 shadow-md backdrop-blur-xl";
      case "FAILED": return "bg-red-500/90 text-white border-red-500 shadow-md backdrop-blur-xl";
      default: return "bg-gray-500/90 text-white border-gray-500 shadow-md backdrop-blur-xl";
    }
  };

  const progress = Math.min(100, Math.round((campaign.amountRaised / campaign.goalAmount) * 100));

  return (
    <Link href={`/campaigns/${campaign.id}`} className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {/* We use standard img for dummy thumbnails if next/image throws domain errors */}
        <img 
          src={campaign.thumbnailUrl || "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=600&auto=format&fit=crop"} 
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md ${getStatusColor(campaign.status)}`}>
          {campaign.status}
        </div>

        {/* Short Description overlay on hover */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/60 backdrop-blur-sm">
          <p className="text-sm font-medium text-white line-clamp-3">{campaign.shortDescription}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight line-clamp-1">{campaign.title}</h3>
          <p className="text-sm text-muted-foreground">{campaign.category}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mt-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-primary">{campaign.amountRaised.toLocaleString()} ETH raised</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-right">
            Goal: {campaign.goalAmount.toLocaleString()} ETH
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-xs font-medium text-muted-foreground">
          <span>{campaign.tokenSymbol} @ {campaign.pricePerToken} ETH</span>
          <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
