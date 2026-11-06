"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, Download, Server, Terminal, Shield, Sparkles } from "lucide-react";
import { generateDockerCompose, StackToolItem } from "@/lib/docker-stack";

interface DockerStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: StackToolItem[];
  onRemoveTool?: (slug: string) => void;
}

export default function DockerStackModal({
  isOpen,
  onClose,
  tools,
  onRemoveTool,
}: DockerStackModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const yamlContent = generateDockerCompose(tools);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([yamlContent], { type: "text/yaml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "docker-compose.yml";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/15 bg-[#0a0a0c] shadow-2xl shadow-cyan-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
              <Server className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-white">Docker Stack Generator</h3>
                <span className="rounded-full bg-cyan-400/20 border border-cyan-400/30 px-2.5 py-0.5 text-xs font-semibold text-cyan-200">
                  {tools.length} {tools.length === 1 ? "Service" : "Services"}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Production-ready multi-container configuration with auto-offset ports & persistent volumes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 hover:border-white/20 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Services Chips */}
        {tools.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-white/5 bg-white/[0.01]">
            <span className="text-xs text-white/40 mr-1">Stack:</span>
            {tools.map((t) => (
              <span
                key={t.slug}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80"
              >
                <span>{t.name}</span>
                {onRemoveTool && (
                  <button
                    type="button"
                    onClick={() => onRemoveTool(t.slug)}
                    className="text-white/40 hover:text-rose-400 transition"
                    title={`Remove ${t.name} from stack`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* YAML Code Viewer */}
        <div className="relative flex-1 overflow-y-auto p-6 bg-black/60 font-mono text-xs leading-relaxed text-cyan-100/90 selection:bg-cyan-500/30">
          <pre className="overflow-x-auto whitespace-pre font-mono">
            <code>{yamlContent}</code>
          </pre>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 px-6 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Terminal className="h-4 w-4 text-cyan-300" />
            <span>
              Run: <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-200">docker compose up -d</code>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-white/70" />
                  <span>Copy docker-compose.yml</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/20 px-4 py-2.5 text-xs font-semibold text-cyan-100 shadow-md shadow-cyan-500/10 transition hover:bg-cyan-400/30 active:scale-95"
            >
              {downloaded ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 text-cyan-200" />
                  <span>Download .yml</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
