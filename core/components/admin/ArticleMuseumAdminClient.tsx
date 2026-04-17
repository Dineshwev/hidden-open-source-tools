"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  RefreshCw, 
  ShieldAlert, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type Article = {
  id: string;
  slug: string;
  tool_name: string;
  title: string;
  mystery_intro: string;
  superpower: string;
  origin_story: string;
  why_care: string;
  user_case?: string;
  hands_on_code: string;
  read_time: string;
  tags: string[];
  is_published: boolean;
  published_at: string;
  views: number;
};

import AdminVerification from "@/components/admin/AdminVerification";

export default function ArticleMuseumAdminClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationSecret, setVerificationSecret] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({});

  const fetchArticles = useCallback(async () => {
    if (!verificationSecret) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/articles", {
        headers: { Authorization: verificationSecret }
      });
      if (res.data.success) {
        setArticles(res.data.data || []);
      } else {
        setError(res.data.error || "Failed to load articles");
      }
    } catch {
      setError("Network error or unauthorized access");
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
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_secret_session");
    if (saved) {
      setVerificationSecret(saved);
      axios.post("/api/admin/verify", { secret: saved })
        .then(res => {
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
      void fetchArticles();
    }
  }, [isVerified, fetchArticles]);

  async function togglePublish(article: Article) {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(`/api/admin/articles/${article.id}/publish`, 
        { is_published: !article.is_published },
        { headers: { Authorization: verificationSecret } }
      );
      if (res.data.success) {
        void fetchArticles();
      } else {
        alert(res.data.error || "Failed to update");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteArticle(id: string) {
    if (actionLoading || !confirm("Are you sure you want to delete this article?")) return;
    setActionLoading(true);
    try {
      const res = await axios.delete(`/api/admin/articles/${id}`, {
        headers: { Authorization: verificationSecret }
      });
      if (res.data.success) {
        void fetchArticles();
      } else {
        alert(res.data.error || "Failed to delete");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const url = editingId ? `/api/admin/articles/${editingId}` : "/api/admin/articles";
      const method = editingId ? "patch" : "post";

      const res = await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: verificationSecret }
      });

      if (res.data.success) {
        setShowForm(false);
        setFormData({});
        setEditingId(null);
        void fetchArticles();
      } else {
        alert(res.data.error || "Failed to save article");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditForm = (article: Article) => {
    setFormData(article);
    setEditingId(article.id);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setFormData({
      slug: "",
      tool_name: "",
      title: "",
      mystery_intro: "",
      superpower: "",
      origin_story: "",
      why_care: "",
      user_case: "",
      hands_on_code: "",
      read_time: "5 min",
      tags: []
    });
    setEditingId(null);
    setShowForm(true);
  };

  if (!isVerified) {
    return (
      <AdminVerification 
        onVerify={handleVerify} 
        verifying={verifying} 
        secret={verificationSecret} 
        setSecret={setVerificationSecret} 
        accentColor="purple"
        title="Article Museum Management"
        description="This section is protected. Please enter the master admin secret to access the Article Museum gallery tools."
      />
    );
  }

  return (
    <div className="space-y-6 text-white min-h-[50vh] pb-12">
      <section className="glass-panel overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Article Museum</p>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">Manage Content</h1>
            <p className="max-w-2xl text-sm text-white/60">
              Create, edit, and publish deep-dive articles for the Article Museum gallery.
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-display font-bold text-black transition hover:bg-zinc-200"
          >
            <Plus className="h-5 w-5" />
            New Article
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {showForm && (
        <section className="glass-panel animate-in fade-in slide-in-from-bottom-4 rounded-[2rem] border border-white/10 p-6 md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white">{editingId ? "Edit Article" : "New Article"}</h2>
            <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white transition">Cancel</button>
          </div>
          
          <form onSubmit={submitForm} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/45">Slug (URL segment)</label>
                <input required name="slug" value={formData.slug || ""} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" placeholder="my-amazing-tool" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/45">Tool Name</label>
                <input required name="tool_name" value={formData.tool_name || ""} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" placeholder="Tool.js" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest text-white/45">Full Title</label>
                <input required name="title" value={formData.title || ""} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" placeholder="The Ultimate Guide to Tool.js" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/45">Read Time</label>
                <input name="read_time" value={formData.read_time || ""} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" placeholder="5 min" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/45">Tags (comma separated)</label>
                <input name="tags" value={(formData.tags || []).join(", ")} onChange={handleTagsChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" placeholder="react, library, devtools" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/45">Mystery Intro</label>
              <textarea name="mystery_intro" value={formData.mystery_intro || ""} onChange={handleFormChange} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/45">Superpower (The hook)</label>
              <textarea name="superpower" value={formData.superpower || ""} onChange={handleFormChange} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/45">Origin Story</label>
              <textarea name="origin_story" value={formData.origin_story || ""} onChange={handleFormChange} rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/45">User Case (Optional)</label>
              <textarea name="user_case" value={formData.user_case || ""} onChange={handleFormChange} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" placeholder="When would a developer choose this over alternatives?" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/45">Why You Should Care</label>
              <textarea name="why_care" value={formData.why_care || ""} onChange={handleFormChange} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-400/40" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/45">Hands On Code (Markdown or Snippets)</label>
              <textarea name="hands_on_code" value={formData.hands_on_code || ""} onChange={handleFormChange} rows={8} className="w-full font-mono rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-purple-400/40" />
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button disabled={actionLoading} type="submit" className="flex-[2] rounded-2xl bg-purple-500 py-4 font-display font-bold text-white transition hover:bg-purple-600 disabled:opacity-50">
                {actionLoading ? "Saving..." : editingId ? "Update Article" : "Create Article"}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({});
                }} 
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-display font-bold text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {loading && !showForm ? (
        <div className="flex flex-col items-center justify-center p-24 text-white/30 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p>Syncing gallery content...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <article key={article.id} className="glass-panel group relative flex flex-wrap items-center justify-between gap-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]">
              <div className="flex flex-1 flex-col gap-1 min-w-[240px]">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${article.is_published ? "bg-emerald-400" : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]"}`} />
                  <h3 className="font-display text-lg font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">{article.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="font-mono text-purple-400/80">/{article.slug}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views || 0}</span>
                  <span className="line-clamp-1">Tool: {article.tool_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(article)}
                  disabled={actionLoading}
                  className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                    article.is_published 
                      ? "border-amber-400/20 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20" 
                      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                  }`}
                >
                  {article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="hidden sm:inline">{article.is_published ? "Unpublish" : "Publish"}</span>
                </button>
                <button
                  onClick={() => openEditForm(article)}
                  disabled={actionLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteArticle(article.id)}
                  disabled={actionLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
          {articles.length === 0 && !loading && (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-24 text-center">
              <EyeOff className="mx-auto h-12 w-12 text-white/20" />
              <h3 className="mt-4 text-xl font-bold text-white/40">The museum is empty</h3>
              <p className="mt-2 text-sm text-white/30">Start by creating your first deep-dive article.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
