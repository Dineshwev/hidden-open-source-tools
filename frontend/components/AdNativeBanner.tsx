"use client";
import { useEffect, useRef } from "react";

export default function AdNativeBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject the Adsterra Native Banner script dynamically safely
    if (containerRef.current && !containerRef.current.querySelector('script')) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = "https://pl29057276.profitablecpmratenetwork.com/5a4d086b51b32fe710349dc77b6dc6d9/invoke.js";
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full flex justify-center py-6 border-y border-white/5 bg-void/50 my-8">
      <div className="max-w-[728px] min-h-[90px] w-full relative">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[150%] text-[10px] text-white/30 tracking-widest uppercase">Advertisement</span>
        <div id="container-5a4d086b51b32fe710349dc77b6dc6d9" ref={containerRef}></div>
      </div>
    </div>
  );
}
