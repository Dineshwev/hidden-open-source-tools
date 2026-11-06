"use client";

import { useState } from "react";
import { Server, Sparkles } from "lucide-react";
import DockerStackModal from "@/components/tools/DockerStackModal";

interface AlternativesStackActionProps {
  saasName: string;
  tools: { name: string; slug: string; best_for?: string }[];
}

export default function AlternativesStackAction({
  saasName,
  tools,
}: AlternativesStackActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!tools || tools.length === 0) return null;

  const stackTools = tools.map((t) => ({
    name: t.name,
    slug: t.slug,
  }));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/15 px-3.5 py-2 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-400/25 active:scale-95 shadow-sm shadow-cyan-500/10"
        title={`Generate Docker Compose template for ${saasName} alternatives`}
      >
        <Server className="h-4 w-4 text-cyan-300" />
        <span>Generate Compose Stack ({tools.length} Tools)</span>
      </button>

      <DockerStackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tools={stackTools}
      />
    </>
  );
}
