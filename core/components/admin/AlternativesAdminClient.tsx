"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Alternative = {
  id: string;
  saas_name: string;
  saas_slug: string;
  saas_description: string;
  status: string;
  created_at: string;
};

export default function AlternativesAdminClient() {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function fetchAlternatives() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("alternatives")
        .select("id, saas_name, saas_slug, saas_description, status, created_at")
        .order("created_at", { ascending: false });
      if (error) console.error("Fetch error:", error);
      setAlternatives(data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlternatives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(id: string) {
    await supabase.from("alternatives").update({ status: "approved" }).eq("id", id);
    fetchAlternatives();
  }

  async function handleDelete(id: string) {
    await supabase.from("alternatives").delete().eq("id", id);
    fetchAlternatives();
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Alternatives</p>
        <h2 className="mt-1 text-xl text-white">Manage Alternatives Pages</h2>
        <p className="mt-2 text-sm text-white/50">
          Approve generated alternatives to make them live at /alternatives/[slug]
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Queue</p>
        <h2 className="mt-1 text-xl text-white">All Alternatives</h2>
        {loading ? (
          <p className="mt-4 text-sm text-white/50">Loading...</p>
        ) : alternatives.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">No alternatives yet. Run: npm run generate-alternatives</p>
        ) : (
          <div className="mt-4 space-y-3">
            {alternatives.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Alternatives to {a.saas_name}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    /{a.saas_slug} · 
                    <span className={`ml-1 ${a.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {a.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {a.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(a.id)}
                      className="rounded-full border border-emerald-400/20 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-400/10"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="rounded-full border border-red-400/20 px-3 py-1 text-xs text-red-300 hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
