"use client";

import { useEffect, useState, useRef } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        setProgress(scrolled);
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 origin-left bg-gradient-to-r from-transparent via-nebula-400 to-ember shadow-glow-sm">
      <div 
        className="h-full bg-gradient-to-r from-nebula-500 via-[#7f96ff] to-ember animate-pulse transition-all duration-300 ease-out"
        style={{ 
          transform: `scaleX(${progress / 100})`,
          filter: `hue-rotate(${progress}deg)`
        }}
      />
      {progress > 5 && (
        <div className="absolute right-0 top-full mr-4 mt-1 w-20 -skew-x-12 bg-white/5 backdrop-blur-sm rounded-full p-1.5 shadow-glow-xs animate-glitch-scan">
          <div className="h-1 bg-gradient-to-r from-aurora to-nebula-400 rounded-full animate-pulse" 
               style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  );
}
