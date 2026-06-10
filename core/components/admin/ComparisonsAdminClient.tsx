"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { RefreshCw, Trash2, ShieldAlert, Plus } from "lucide-react";
import AdminVerification from "@/components/admin/AdminVerification";
import { createClient } from "@supabase/supabase-js";

type Comparison = {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  status: string;
  created_at: string;
};

export default function ComparisonsAdminClient() {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationSecret, setVerificationSecret] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [toolA, setToolA] = useState("");
  const [toolB, setToolB] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function fetchComparisons() {
    setLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      console.log("Supabase URL:", supabaseUrl);
      console.log("Supabase Key exists:", !!supabaseKey);
      
      const { data, error } = await supabase
        .from("comparisons")
        .select("*")
        .order("created_at", { ascending: false });
      
      console.log("Raw data:", data);
      console.log("Raw error:", error);
      
      if (error) {
        console.error("Supabase error:", error.message);
        setComparisons([]);
      } else {
        setComparisons(data || []);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setComparisons([]);
    } finally {
      setLoading(false);
    }
  }

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
    fetchComparisons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolA.trim() || !toolB.trim()) {
      setSubmitMessage("Both tool names are required.");
      return;
    }
    setSubmitting(true);
    setSubmitMessage("");
    const slug = `${toolA.trim().toLowerCase().replace(/\s+/g, "-")}-vs-${toolB
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    const { error: insertError } = await supabase.from("comparisons").insert({
      slug,
      tool_a: toolA.trim(),
      tool_b: toolB.trim(),
      status: "pending",
    });

    if (insertError) {
      setSubmitMessage(`Error: ${insertError.message}`);
    } else {
      setSubmitMessage(`✅ Added: ${slug}`);
      setToolA("");
      setToolB("");
      void fetchComparisons();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (actionLoadingId) return;
    setActionLoadingId(id);
    
    const { error: deleteError } = await supabase.from("comparisons").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      void fetchComparisons();
    }
    setActionLoadingId(null);
  };

  if (!isVerified) {
    return (
      <AdminVerification
        onVerify={handleVerify}
        verifying={verifying}
        secret={verificationSecret}
        setSecret={setVerificationSecret}
        accentColor="orange"
        title="Comparisons Management"
        description="Verify the admin session to manage comparison pairs and review status."
      />
    );
  }

  return (
    <div className="space-y-6 text-white min-h-[50vh] pb-12">
      <section className="glass-panel overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-500/10 to-transparent p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Comparisons</p>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">Manage Comparisons</h1>
            <p className="max-w-2xl text-sm text-white/60">
              Add new tool comparison pairs, review pending comparisons, and manage existing ones.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchComparisons()}
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

      <section className="glass-panel rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl font-semibold text-white mb-4">Add Comparison Pair</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Tool A (e.g. Plausible)"
            value={toolA}
            onChange={(e) => setToolA(e.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors"
          />
          <input
            type="text"
            placeholder="Tool B (e.g. Google Analytics)"
            value={toolB}
            onChange={(e) => setToolB(e.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-400/20 bg-orange-400/10 px-6 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-400/20 disabled:opacity-60"
          >
            {submitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Add Pair</span>
          </button>
        </form>
        {submitMessage && (
          <p className="mt-3 text-sm text-orange-200/80">{submitMessage}</p>
        )}
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-white/30 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p>Loading comparisons...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {comparisons.map((c) => {
            const isPending = c.status === "pending";

            return (
              <article
                key={c.id}
                className="glass-panel group relative flex flex-wrap items-center justify-between gap-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
              >
                <div className="flex flex-1 flex-col gap-1 min-w-[240px]">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${isPending ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" : "bg-emerald-400"}`} />
                    <h3 className="font-display text-lg font-semibold text-white transition-colors group-hover:text-orange-300 line-clamp-1">
                      {c.tool_a} vs {c.tool_b}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                    <span className="font-mono text-orange-400/80">/{c.slug}</span>
                    <span>Status: {c.status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDelete(c.id)}
                    disabled={actionLoadingId === c.id}
                    className="flex h-10 items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 text-sm font-medium text-rose-200 transition hover:bg-rose-400/20 disabled:opacity-60"
                  >
                    {actionLoadingId === c.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            );
          })}

          {comparisons.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-24 text-center">
              <ShieldAlert className="mx-auto h-12 w-12 text-white/20" />
              <h3 className="mt-4 text-xl font-bold text-white/40">No comparisons found</h3>
              <p className="mt-2 text-sm text-white/30">Add a comparison pair above to get started.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
