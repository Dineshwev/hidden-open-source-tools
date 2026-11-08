"use client";

import { useEffect, useState } from "react";
import { Server, Sparkles, X, Trash2, ArrowRight } from "lucide-react";
import {
  getSavedToolsMeta,
  removeSavedTool,
  clearSavedSlugs,
  SavedToolMeta,
} from "@/lib/saved-tools";
import DockerStackModal from "./DockerStackModal";

export default function FloatingStackDock() {
  const [tools, setTools] = useState<SavedToolMeta[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTools(getSavedToolsMeta());

    const handleSavedChange = () => {
      setTools(getSavedToolsMeta());
    };

    window.addEventListener("cloudrain:saved-change", handleSavedChange);
    return () => window.removeEventListener("cloudrain:saved-change", handleSavedChange);
  }, []);

  if (!mounted || tools.length === 0) return null;

  const displayTools = tools.slice(0, 3);
  const remainingCount = tools.length - displayTools.length;

  return (
    <>
      {/* Floating Bottom Dock */}
      <aside
        aria-label="Personal Open-Source Stack Dock"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-cyan-400/30 bg-[#0c1017]/95 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl">
          {/* Badge & Count */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-300">
              <Server className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-slate-950">
                {tools.length}
              </span>
            </span>
            <span className="hidden md:inline font-display text-xs font-semibold text-white">
              My Stack
            </span>
          </div>

          <div className="h-5 w-px bg-white/10 shrink-0" />

          {/* Tool Chips Preview */}
          <div className="flex items-center gap-1.5 overflow-hidden">
            {displayTools.map((t) => (
              <span
                key={t.slug}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/80 shrink-0 max-w-[110px] truncate"
                title={t.name}
              >
                <span className="truncate">{t.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSavedTool(t.slug);
                  }}
                  className="text-white/40 hover:text-rose-400 transition"
                  title={`Remove ${t.name}`}
                  aria-label={`Remove ${t.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="text-xs text-white/50 shrink-0 font-medium">
                +{remainingCount}
              </span>
            )}
          </div>

          <div className="h-5 w-px bg-white/10 shrink-0" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs shadow-md shadow-cyan-500/20 transition active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export docker-compose</span>
              <span className="sm:hidden">Compose</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => clearSavedSlugs()}
              className="rounded-xl border border-white/10 bg-white/5 p-1.5 sm:p-2 text-white/50 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 transition"
              title="Clear all saved tools"
              aria-label="Clear all saved tools"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Docker Stack Modal */}
      <DockerStackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tools={tools}
        onRemoveTool={(slug) => removeSavedTool(slug)}
      />
    </>
  );
}
