"use client";

import { useEffect, useState } from "react";
import { Github } from "lucide-react";
import { motion } from "framer-motion";

export default function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    async function fetchStars() {
      try {
        const res = await fetch("https://api.github.com/repos/Dineshwev/hidden-open-source-tools", {
          next: { revalidate: 3600 }
        } as any);
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        setStars(data.stargazers_count);
      } catch (error) {
        console.error("Github fetch error:", error);
        setFailed(true);
      }
    }

    fetchStars();
  }, []);

  return (
    <motion.a
      href="https://github.com/Dineshwev/hidden-open-source-tools"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--nav-border)] bg-[color:var(--nav-pill-bg)] px-3 py-1.5 text-sm font-medium text-[color:var(--nav-text)] transition-all hover:bg-[color:var(--nav-pill-hover)] hover:brightness-110 active:scale-95 md:px-4"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Github className="h-4 w-4" />
      <span className="hidden sm:inline">Star</span>
      
      {!failed && (
        <div className="flex items-center gap-1 border-l border-white/10 pl-2 text-xs text-[color:var(--nav-muted)]">
          {stars !== null ? (
            <span className="animate-in fade-in transition-all duration-500">{stars.toLocaleString()}</span>
          ) : (
            <span className="opacity-40 animate-pulse">---</span>
          )}
        </div>
      )}
    </motion.a>
  );
}
