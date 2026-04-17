"use client";

import React from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface AdminVerificationProps {
  onVerify: (e: React.FormEvent) => void;
  verifying: boolean;
  secret: string;
  setSecret: (s: string) => void;
  title?: string;
  description?: string;
  accentColor?: string;
}

export default function AdminVerification({
  onVerify,
  verifying,
  secret,
  setSecret,
  title = "Admin Verification",
  description = "This section is protected. Please enter the master admin secret to access this panel.",
  accentColor = "cyan"
}: AdminVerificationProps) {
  const accentClasses = {
    cyan: "bg-cyan-400/20 text-cyan-400 border-cyan-400/40 ring-cyan-400/20",
    purple: "bg-purple-400/20 text-purple-400 border-purple-400/40 ring-purple-400/20",
    amber: "bg-amber-400/20 text-amber-400 border-amber-400/40 ring-amber-400/20"
  }[accentColor as "cyan" | "purple" | "amber"] || "bg-cyan-400/20 text-cyan-400 border-cyan-400/40 ring-cyan-400/20";

  const colorHex = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    amber: "text-amber-400"
  }[accentColor as "cyan" | "purple" | "amber"] || "text-cyan-400";

  const blurColor = {
    cyan: "bg-cyan-400/20",
    purple: "bg-purple-400/20",
    amber: "bg-amber-400/20"
  }[accentColor as "cyan" | "purple" | "amber"] || "bg-cyan-400/20";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 px-6 text-center">
      <div className="relative">
        <div className={`absolute -inset-4 rounded-full blur-2xl ${blurColor}`} />
        <ShieldAlert className={`relative h-16 w-16 ${colorHex}`} />
      </div>
      <div className="space-y-3">
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">{title}</h1>
        <p className="max-w-md text-white/60 md:text-lg">
          {description}
        </p>
      </div>
      <form onSubmit={onVerify} className="flex w-full max-w-sm flex-col gap-4">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter secret key..."
          className={`w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-lg text-white outline-none transition focus:border-opacity-100 focus:ring-1 ${accentClasses.split(' ').slice(2).join(' ')}`}
          autoFocus
        />
        <button
          type="submit"
          disabled={verifying}
          className="flex h-14 items-center justify-center rounded-2xl bg-white font-display text-lg font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
        >
          {verifying ? <RefreshCw className="h-6 w-6 animate-spin" /> : "Verify Access"}
        </button>
      </form>
    </div>
  );
}
