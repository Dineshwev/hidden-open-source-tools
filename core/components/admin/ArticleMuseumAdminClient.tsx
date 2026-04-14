"use client";

import { useEffect, useState } from "react";

type Article = {
  id: string;
  slug: string;
  tool_name: string;
  title: string;
  mystery_intro: string;
  superpower: string;
  origin_story: string;
  why_care: string;
  hands_on_code: string;
  read_time: string;
  tags: string[];
  is_published: boolean;
  published_at: string;
  views: number;
};

export default function ArticleMuseumAdminClient({ secret }: { secret: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles", {
        headers: { "x-admin-secret": secret }
      });
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
      } else {
        setError(data.error || "Failed to load articles");
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(article: Article) {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret
        },
        body: JSON.stringify({ is_published: !article.is_published })
      });
      const data = await res.json();
      if (data.success) {
        fetchArticles();
      } else {
        alert(data.error || "Failed to update");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteArticle(id: string) {
    if (actionLoading || !confirm("Are you sure you want to delete this article?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-secret": secret
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchArticles();
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  // Basic Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({});

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const url = editingId ? `/api/admin/articles/${editingId}` : "/api/admin/articles";
      const method = editingId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({});
        setEditingId(null);
        fetchArticles();
      } else {
        alert(data.error || "Failed to save article");
      }
    } catch (e) {
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
      slug: "", tool_name: "", title: "", mystery_intro: "", superpower: "", 
      origin_story: "", why_care: "", hands_on_code: "", read_time: "5 min", tags: []
    });
    setEditingId(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 text-white min-h-[50vh]">
      <div className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-white/10">
        <h1 className="text-2xl font-bold font-display">Manage Articles</h1>
        <button 
          onClick={openCreateForm}
          className="bg-cyan-400 hover:bg-cyan-500 text-black px-4 py-2 rounded-lg font-medium transition"
        >
          Create New Article
        </button>
      </div>

      {error ? <div className="text-red-400 p-4 bg-red-400/10 rounded-lg">{error}</div> : null}

      {showForm && (
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl mb-4">{editingId ? "Edit Article" : "New Article"}</h2>
          <form onSubmit={submitForm} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1 text-white/50">Slug</label>
                <input required name="slug" value={formData.slug || ""} onChange={handleFormChange} className="w-full bg-white/5 border border-white/10 p-2 rounded" />
              </div>
              <div>
                <label className="block text-xs mb-1 text-white/50">Tool Name</label>
                <input required name="tool_name" value={formData.tool_name || ""} onChange={handleFormChange} className="w-full bg-white/5 border border-white/10 p-2 rounded" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1 text-white/50">Title</label>
                <input required name="title" value={formData.title || ""} onChange={handleFormChange} className="w-full bg-white/5 border border-white/10 p-2 rounded" />
              </div>
              <div>
                <label className="block text-xs mb-1 text-white/50">Read Time</label>
                <input name="read_time" value={formData.read_time || ""} onChange={handleFormChange} className="w-full bg-white/5 border border-white/10 p-2 rounded" placeholder="5 min" />
              </div>
              <div>
                <label className="block text-xs mb-1 text-white/50">Tags (comma separated)</label>
                <input name="tags" value={(formData.tags || []).join(", ")} onChange={handleTagsChange} className="w-full bg-white/5 border border-white/10 p-2 rounded" />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1 text-white/50">Mystery Intro</label>
              <textarea name="mystery_intro" value={formData.mystery_intro || ""} onChange={handleFormChange} rows={3} className="w-full bg-white/5 border border-white/10 p-2 rounded" />
            </div>
            
            <div>
              <label className="block text-xs mb-1 text-white/50">Superpower</label>
              <textarea name="superpower" value={formData.superpower || ""} onChange={handleFormChange} rows={3} className="w-full bg-white/5 border border-white/10 p-2 rounded" />
            </div>

            <div>
              <label className="block text-xs mb-1 text-white/50">Origin Story</label>
              <textarea name="origin_story" value={formData.origin_story || ""} onChange={handleFormChange} rows={4} className="w-full bg-white/5 border border-white/10 p-2 rounded" />
            </div>

            <div>
              <label className="block text-xs mb-1 text-white/50">Why You Should Care</label>
              <textarea name="why_care" value={formData.why_care || ""} onChange={handleFormChange} rows={3} className="w-full bg-white/5 border border-white/10 p-2 rounded" />
            </div>

            <div>
              <label className="block text-xs mb-1 text-white/50">Hands On Code</label>
              <textarea name="hands_on_code" value={formData.hands_on_code || ""} onChange={handleFormChange} rows={5} className="w-full bg-white/5 border border-white/10 p-2 rounded font-mono" />
            </div>

            <div className="flex gap-4 pt-4">
              <button disabled={actionLoading} type="submit" className="bg-cyan-400 text-black px-6 py-2 rounded-lg font-medium hover:bg-cyan-500 transition">
                {actionLoading ? "Saving..." : "Save Article"}
              </button>
              <button disabled={actionLoading} type="button" onClick={() => setShowForm(false)} className="bg-white/10 px-6 py-2 rounded-lg hover:bg-white/20 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="animate-pulse flex items-center justify-center p-12 text-white/50">Loading articles...</div>
      ) : (
        <div className="grid gap-4">
          {articles.map(article => (
            <div key={article.id} className="flex items-center justify-between bg-black/20 border border-white/10 p-4 rounded-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${article.is_published ? "bg-green-400" : "bg-yellow-400"}`}></span>
                  <span className="font-medium">{article.title}</span>
                  <span className="text-xs text-white/40">({article.slug})</span>
                </div>
                <div className="text-xs text-white/50 flex gap-4">
                  <span>Tool: {article.tool_name}</span>
                  <span>Views: {article.views || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => togglePublish(article)}
                  disabled={actionLoading}
                  className={`px-3 py-1 text-xs rounded border transition ${article.is_published ? "border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10" : "border-green-400/30 text-green-400 hover:bg-green-400/10"}`}
                >
                  {article.is_published ? "Unpublish" : "Publish"}
                </button>
                <button 
                  onClick={() => openEditForm(article)}
                  disabled={actionLoading}
                  className="px-3 py-1 text-xs rounded border border-blue-400/30 text-blue-400 hover:bg-blue-400/10 transition"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteArticle(article.id)}
                  disabled={actionLoading}
                  className="px-3 py-1 text-xs rounded border border-red-400/30 text-red-400 hover:bg-red-400/10 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {articles.length === 0 && !loading && (
            <div className="text-center p-10 text-white/40 bg-black/20 rounded-xl border border-white/5">
              No articles found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
