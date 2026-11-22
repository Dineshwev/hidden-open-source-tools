"use client";

import { useState } from "react";
import { ExternalLink, Github } from "lucide-react";

export default function RepoPreviewCard({
  toolName,
  owner,
  repo,
  githubUrl,
}: {
  toolName: string;
  owner: string;
  repo: string;
  githubUrl: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !owner || !repo) return null;

  const previewUrl = `https://opengraph.githubassets.com/1/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs">
        <span className="flex items-center gap-2 font-medium text-white/80">
          <Github className="h-4 w-4 text-cyan-400" />
          <span>
            {owner}/{repo} — Repository Preview
          </span>
        </span>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-cyan-300 hover:text-cyan-200 transition"
        >
          <span>Open on GitHub</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="relative aspect-[2/1] w-full bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={`${toolName} GitHub repository preview (${owner}/${repo})`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
