import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      
      {/* Hero Section */}
      <section className="text-center w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          The Future of Business Crowdfunding
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
          Fund Your Vision. <br />
          Trade Your Future.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light">
          VentureHiveX redefines secondary market trading and startup investments. Launch your campaign, issue tokens natively, and participate in a borderless Web3 economy.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/campaigns">
            <Button size="lg" className="h-12 px-8 text-base shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-primary/40 transition-all hover:shadow-primary/60">
              Explore Campaigns
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-md border-white/10 hover:bg-white/5">
              Launch Startup
            </Button>
          </Link>
        </div>
      </section>

      {/* Abstract Illustration Placeholder */}
      <div className="relative w-full max-w-4xl mx-auto h-64 md:h-96 mt-12 rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15)_0,transparent_50%)]"></div>
        {/* Abstract shapes representing business nodes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 grid grid-cols-3 gap-8 opacity-70">
           <div className="w-16 h-16 rounded-xl border border-primary/30 rotate-12 flex items-center justify-center bg-black/40 backdrop-blur-md">
             <span className="text-primary font-bold">ETH</span>
           </div>
           <div className="w-24 h-24 rounded-full border border-white/20 -translate-y-8 flex items-center justify-center bg-primary/10 backdrop-blur-md">
             <span className="text-white font-bold">VHX</span>
           </div>
           <div className="w-16 h-16 rounded-xl border border-primary/30 -rotate-12 flex items-center justify-center bg-black/40 backdrop-blur-md">
             <span className="text-primary font-bold">DAO</span>
           </div>
        </div>
      </div>
      
    </div>
  );
}
