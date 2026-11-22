"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

export default function CopyCodeBlock({
  code,
  label = "Quickstart Command / Config",
}: {
  code: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-white/75">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          <span>{label}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/85 transition hover:border-cyan-400/50 hover:text-cyan-200"
          aria-label="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-emerald-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}
