"use client";
import { useEffect, useState } from "react";
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
  const [toolA, setToolA] = useState("");
  const [toolB, setToolB] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function fetchComparisons() {
    setLoading(true);
    const { data } = await supabase
      .from("comparisons")
      .select("*")
      .order("created_at", { ascending: false });
    setComparisons(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchComparisons();
  }, []);

  async function handleSubmit() {
    if (!toolA.trim() || !toolB.trim()) {
      setMessage("Both tool names are required.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    const slug = `${toolA.trim().toLowerCase().replace(/\s+/g, "-")}-vs-${toolB
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    const { error } = await supabase.from("comparisons").insert({
      slug,
      tool_a: toolA.trim(),
      tool_b: toolB.trim(),
      status: "pending",
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(`✅ Added: ${slug}`);
      setToolA("");
      setToolB("");
      fetchComparisons();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("comparisons").delete().eq("id", id);
    fetchComparisons();
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Comparisons</p>
        <h2 className="mt-1 text-xl text-white">Add Comparison Pair</h2>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Tool A (e.g. Plausible)"
            value={toolA}
            onChange={(e) => setToolA(e.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
          />
          <input
            type="text"
            placeholder="Tool B (e.g. Google Analytics)"
            value={toolB}
            onChange={(e) => setToolB(e.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-2xl bg-orange-400/20 border border-orange-300/30 px-6 py-3 text-sm font-semibold text-orange-100 transition hover:bg-orange-400/30 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Pair"}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-white/70">{message}</p>}
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">All Pairs</p>
        <h2 className="mt-1 text-xl text-white">Comparison Queue</h2>
        {loading ? (
          <p className="mt-4 text-sm text-white/50">Loading...</p>
        ) : comparisons.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">No comparisons yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {comparisons.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{c.tool_a} vs {c.tool_b}</p>
                  <p className="text-xs text-white/40 mt-0.5">{c.slug} · {c.status}</p>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="rounded-full border border-red-400/20 px-3 py-1 text-xs text-red-300 hover:bg-red-400/10"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
