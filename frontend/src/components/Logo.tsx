import Link from "next/link";
import { Hexagon } from "lucide-react";

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export function Logo({ className = "", iconSize = 36, textSize = "text-2xl" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="relative flex items-center justify-center">
        <Hexagon
          size={iconSize}
          className="text-primary group-hover:scale-110 transition-transform duration-500 ease-out"
          strokeWidth={1.5}
        />
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
      </div>
      <div className="flex flex-col">
        <span className={`font-black tracking-tight leading-none ${textSize}`}>
          Venture<span className="text-primary italic">Hive</span>X
        </span>
      </div>
    </Link>
  );
}
