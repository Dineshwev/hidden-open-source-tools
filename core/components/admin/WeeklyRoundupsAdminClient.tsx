"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Eye, EyeOff, RefreshCw, ShieldAlert } from "lucide-react";
import AdminVerification from "@/components/admin/AdminVerification";

type WeeklyRoundup = {
  id: string;
  title: string;
  slug: string;
  week_date: string;
  status: "draft" | "published";
  created_at: string;
};

type WeeklyRoundupsResponse = {
  success: boolean;
  data?: WeeklyRoundup[];
  error?: string;
};

export default function WeeklyRoundupsAdminClient() {
  const [roundups, setRoundups] = useState<WeeklyRoundup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationSecret, setVerificationSecret] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRoundups = useCallback(async () => {
    if (!verificationSecret) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get<WeeklyRoundupsResponse>("/api/admin/weekly-roundups", {
        headers: { Authorization: verificationSecret }
      });

      if (res.data.success) {
        setRoundups(res.data.data || []);
      } else {
        setError(res.data.error || "Failed to load weekly roundups.");
      }
    } catch (fetchError: any) {
      setError(fetchError?.response?.data?.error || "Network error or unauthorized access.");
    } finally {
      setLoading(false);
    }
  }, [verificationSecret]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verificationSecret.trim()) return;

    setVerifying(true);
    try {
      const res = await axios.post("/api/admin/verify", { secret: verificationSecret });
      if (res.data.success) {
        setIsVerified(true);
        sessionStorage.setItem("admin_secret_session", verificationSecret);
      } else {
        setError("Invalid admin secret.");
      }
    } catch (verifyError: any) {
      setError(verifyError?.response?.data?.error || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_secret_session");
    if (saved) {
      setVerificationSecret(saved);
      axios.post("/api/admin/verify", { secret: saved })
        .then((res) => {
          if (res.data.success) {
            setIsVerified(true);
          }
        })
        .catch(() => {
          sessionStorage.removeItem("admin_secret_session");
        });
    }
  }, []);

  useEffect(() => {
    if (isVerified) {
      void fetchRoundups();
    }
  }, [isVerified, fetchRoundups]);

  const toggleStatus = useCallback(async (roundup: WeeklyRoundup) => {
    if (actionLoadingId) return;

    const nextStatus = roundup.status === "published" ? "draft" : "published";
    setActionLoadingId(roundup.id);

    try {
      const res = await axios.patch(
        `/api/admin/weekly-roundups/${roundup.id}/status`,
        { status: nextStatus },
        { headers: { Authorization: verificationSecret } }
      );

      if (res.data.success) {
        setRoundups((previous) =>
          previous.map((item) =>
            item.id === roundup.id
              ? {
                  ...item,
                  status: nextStatus
                }
              : item
          )
        );
      } else {
        setError(res.data.error || "Failed to update roundup status.");
      }
    } catch (updateError: any) {
      setError(updateError?.response?.data?.error || "Unable to update roundup status.");
    } finally {
      setActionLoadingId(null);
    }
  }, [actionLoadingId, verificationSecret]);

  if (!isVerified) {
    return (
      <AdminVerification
        onVerify={handleVerify}
        verifying={verifying}
        secret={verificationSecret}
        setSecret={setVerificationSecret}
        accentColor="cyan"
        title="Weekly Roundups Management"
        description="Verify the admin session to review weekly roundup drafts and publish them when they are ready."
      />
    );
  }

  return (
    <div className="space-y-6 text-white min-h-[50vh] pb-12">
      <section className="glass-panel overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Weekly Roundups</p>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">Manage Publishing</h1>
            <p className="max-w-2xl text-sm text-white/60">
              Review weekly roundup records, switch them between draft and published, and open live pages after release.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchRoundups()}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-display font-bold text-black transition hover:bg-zinc-200"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-white/30 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p>Loading weekly roundups...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {roundups.map((roundup) => {
            const isPublished = roundup.status === "published";

            return (
              <article
                key={roundup.id}
                className="glass-panel group relative flex flex-wrap items-center justify-between gap-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
              >
                <div className="flex flex-1 flex-col gap-1 min-w-[240px]">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]"}`} />
                    <h3 className="font-display text-lg font-semibold text-white transition-colors group-hover:text-cyan-300 line-clamp-1">
                      {roundup.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                    <span className="font-mono text-cyan-400/80">/{roundup.slug}</span>
                    <span>{formatWeekDate(roundup.week_date)}</span>
                    <span>Status: {roundup.status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleStatus(roundup)}
                    disabled={actionLoadingId === roundup.id}
                    className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                      isPublished
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20"
                        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                    } disabled:opacity-60`}
                  >
                    {actionLoadingId === roundup.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : isPublished ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span>{isPublished ? "Move to Draft" : "Publish"}</span>
                  </button>

                  <Link
                    href={`/weekly-roundups/${roundup.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Open</span>
                  </Link>
                </div>
              </article>
            );
          })}

          {roundups.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-24 text-center">
              <ShieldAlert className="mx-auto h-12 w-12 text-white/20" />
              <h3 className="mt-4 text-xl font-bold text-white/40">No weekly roundups found</h3>
              <p className="mt-2 text-sm text-white/30">Run the generator first, then publish the saved draft here.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function formatWeekDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
