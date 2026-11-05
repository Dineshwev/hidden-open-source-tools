"use client";

import { useState } from "react";
import { Check, Copy, Terminal, Server } from "lucide-react";

interface DockerQuickstartProps {
  toolName: string;
  slug: string;
  repoOwner?: string | null;
}

export default function DockerQuickstart({ toolName, slug, repoOwner }: DockerQuickstartProps) {
  const [activeTab, setActiveTab] = useState<"compose" | "cli">("compose");
  const [copied, setCopied] = useState(false);

  // Derive standard container image name
  const imageName = repoOwner ? `${repoOwner.toLowerCase()}/${slug.toLowerCase()}:latest` : `${slug.toLowerCase()}:latest`;

  const composeSnippet = `services:
  ${slug}:
    image: ${imageName}
    container_name: ${slug}
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./${slug}-data:/data`;

  const cliSnippet = `docker run -d \\
  --name ${slug} \\
  --restart unless-stopped \\
  -p 8080:8080 \\
  -v ./${slug}-data:/data \\
  ${imageName}`;

  const currentSnippet = activeTab === "compose" ? composeSnippet : cliSnippet;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
            <Server className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Self-Host with Docker</h2>
            <p className="text-xs text-white/50">Run {toolName} locally or on your private VPS with zero cloud lock-in.</p>
          </div>
        </div>

        {/* Tab Switcher & Copy */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("compose")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === "compose"
                  ? "bg-cyan-400/20 text-cyan-200 border border-cyan-400/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              docker-compose.yml
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cli")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === "cli"
                  ? "bg-cyan-400/20 text-cyan-200 border border-cyan-400/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Docker Run
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            title="Copy command"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-white/60" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="relative mt-4 rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-cyan-200 overflow-x-auto">
        <pre className="leading-relaxed">
          <code>{currentSnippet}</code>
        </pre>
      </div>

      <p className="mt-3 text-[11px] text-white/40 leading-relaxed">
        💡 Note: Adjust port mappings and storage volumes as specified in {toolName}&apos;s official repository documentation.
      </p>
    </section>
  );
}
