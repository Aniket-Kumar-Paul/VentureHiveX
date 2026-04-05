"use client";

import { useEffect, useState } from "react";

export function Starfield() {
  const [layers, setLayers] = useState<{ l1: string, l2: string, l3: string } | null>(null);

  useEffect(() => {
    const createLayer = (count: number) => {
      return Array.from({ length: count }).map(() => {
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        return `${left}vw ${top}vh #FFF`;
      }).join(", ");
    };
    
    setLayers({
      l1: createLayer(150),
      l2: createLayer(75),
      l3: createLayer(25)
    });
  }, []);

  if (!layers) return <div className="fixed inset-0 -z-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />;

  return (
    <div className="fixed inset-0 w-full h-[200vh] overflow-hidden pointer-events-none -z-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <style>{`
        @keyframes animStar {
          from { transform: translateY(-100vh); }
          to { transform: translateY(0vh); }
        }
        .stars1 { width: 1px; height: 1px; background: transparent; box-shadow: ${layers.l1}; animation: animStar 60s linear infinite; }
        .stars1:after { content: " "; position: absolute; top: 100vh; left: 0; width: 1px; height: 1px; background: transparent; box-shadow: ${layers.l1}; }
        
        .stars2 { width: 2px; height: 2px; background: transparent; box-shadow: ${layers.l2}; animation: animStar 120s linear infinite; }
        .stars2:after { content: " "; position: absolute; top: 100vh; left: 0; width: 2px; height: 2px; background: transparent; box-shadow: ${layers.l2}; }
        
        .stars3 { width: 3px; height: 3px; background: transparent; box-shadow: ${layers.l3}; animation: animStar 180s linear infinite; }
        .stars3:after { content: " "; position: absolute; top: 100vh; left: 0; width: 3px; height: 3px; background: transparent; box-shadow: ${layers.l3}; }
      `}</style>
      <div className="stars3" />
      <div className="stars2" />
      <div className="stars1" />
    </div>
  );
}
