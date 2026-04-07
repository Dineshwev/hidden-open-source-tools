"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import api from "@/lib/api";
import type { AdminUpdatePayload, PaginatedResponse, ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

type PendingToolsResponse = PaginatedResponse<ScrapedTool> & {
  error?: string;
};

type ToastState = {
  tone: "success" | "error";
  message: string;
};

const ACCESS_KEY_STORAGE = "cloud_rain_admin_access_key";
const PAGE_SIZE = 12;

function safeDomainLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "external";
  }
}

function trimSummary(text: string | null, maxLength = 160) {
  if (!text) return "No description available.";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export default function ScrapedToolsAdminPanel() {
  const [accessKey, setAccessKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [tools, setTools] = useState<ScrapedTool[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [failedImageIds, setFailedImageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((tone: ToastState["tone"], message: string) => {
    setToast({ tone, message });

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  const loadPendingTools = useCallback(
    async (providedKey: string, targetPage = page) => {
      if (!providedKey) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get<PendingToolsResponse>("/admin/scraped-tools", {
          params: {
            status: "pending",
            page: targetPage,
            limit: PAGE_SIZE
          },
          headers: {
            "x-admin-access-key": providedKey
          }
        });

        const payload = response.data;
        setTools(Array.isArray(payload?.data) ? payload.data : []);
        setTotalPages(typeof payload?.totalPages === "number" ? payload.totalPages : 0);
        setPendingCount(typeof payload?.count === "number" ? payload.count : 0);
        setSelectedIds([]);
      } catch (err: unknown) {
        const maybeError = err as { response?: { data?: { error?: string } } };
        const message = maybeError?.response?.data?.error || "Failed to load pending scraped tools.";
        setError(message);
        setTools([]);
        setTotalPages(0);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedKey = localStorage.getItem(ACCESS_KEY_STORAGE) || "";
    if (!storedKey) {
      return;
    }

    setAccessKey(storedKey);
    setKeyInput(storedKey);
    void loadPendingTools(storedKey, 1);
  }, [loadPendingTools]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!accessKey) {
      return;
    }

    void loadPendingTools(accessKey, page);
  }, [accessKey, page, loadPendingTools]);

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      if (categoryFilter !== "all" && tool.category !== categoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [tool.title, tool.description || "", tool.category, tool.source_site || "", tool.webpage_url]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [tools, categoryFilter, searchQuery]);

  const categoryTabs = useMemo(() => {
    const categoryMap = new Map<string, number>();

    for (const tool of tools) {
      const key = tool.category.trim();
      categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
    }

    return [
      { key: "all", label: "All", count: tools.length },
      ...Array.from(categoryMap.entries()).map(([key, count]) => ({
        key: key as ToolCategory,
        label: key,
        count
      }))
    ];
  }, [tools]);

  const allVisibleSelected = filteredTools.length > 0 && filteredTools.every((tool) => selectedIds.includes(tool.id));

  const toggleId = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((existingId) => existingId !== id) : [...previous, id]
    );
  };

  const selectVisible = () => {
    setSelectedIds(filteredTools.map((tool) => tool.id));
  };

  const handleUnlock = async () => {
    const trimmed = keyInput.trim();

    if (!trimmed) {
      setError("Enter your admin access key.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_KEY_STORAGE, trimmed);
    }

    setAccessKey(trimmed);
    setPage(1);
    await loadPendingTools(trimmed, 1);
    showToast("success", "Scraped tools panel unlocked.");
  };

  const clearStoredAccess = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_KEY_STORAGE);
    }

    setAccessKey("");
    setKeyInput("");
    setTools([]);
    setSelectedIds([]);
    setPendingCount(0);
    setTotalPages(0);
    setPage(1);
    setError("");
    setToast(null);
  };

  const applySingleDecision = async (id: string, status: AdminUpdatePayload["status"]) => {
    if (!accessKey) {
      setError("Unlock the panel first.");
      return;
    }

    const previousTools = tools;
    const nextTools = previousTools.filter((item) => item.id !== id);
    setActionLoading(true);
    setTools(nextTools);
    setSelectedIds((previous) => previous.filter((selectedId) => selectedId !== id));
    setPendingCount((previous) => Math.max(0, previous - 1));

    try {
      await api.patch(
        `/admin/scraped-tools/${id}`,
        { status },
        {
          headers: {
            "x-admin-access-key": accessKey
          }
        }
      );

      showToast("success", status === "approved" ? "Tool approved." : "Tool rejected.");

      if (nextTools.length === 0 && page > 1) {
        setPage((previous) => Math.max(1, previous - 1));
      }
    } catch (err: unknown) {
      const maybeError = err as { response?: { data?: { error?: string } } };
      setTools(previousTools);
      setPendingCount((previous) => previous + 1);
      const message = maybeError?.response?.data?.error || "Failed to update tool status.";
      setError(message);
      showToast("error", message);
    } finally {
      setActionLoading(false);
    }
  };

  const applyBulkDecision = async (status: AdminUpdatePayload["status"]) => {
    if (!accessKey) {
      setError("Unlock the panel first.");
      return;
    }

    if (!selectedIds.length) {
      setError("Select at least one tool first.");
      return;
    }

    const previousTools = tools;
    const idsToUpdate = selectedIds;
    const nextTools = previousTools.filter((item) => !idsToUpdate.includes(item.id));

    setActionLoading(true);
    setTools(nextTools);
    setSelectedIds([]);
    setPendingCount((previous) => Math.max(0, previous - idsToUpdate.length));

    try {
      await api.patch(
        "/admin/scraped-tools/bulk",
        {
          ids: idsToUpdate,
          status
        },
        {
          headers: {
            "x-admin-access-key": accessKey
          }
        }
      );

      showToast(
        "success",
        status === "approved"
          ? `${idsToUpdate.length} tool${idsToUpdate.length === 1 ? "" : "s"} approved.`
          : `${idsToUpdate.length} tool${idsToUpdate.length === 1 ? "" : "s"} rejected.`
      );

      if (nextTools.length === 0 && page > 1) {
        setPage((previous) => Math.max(1, previous - 1));
      }
    } catch (err: unknown) {
      const maybeError = err as { response?: { data?: { error?: string } } };
      setTools(previousTools);
      setPendingCount((previous) => previous + idsToUpdate.length);
      const message = maybeError?.response?.data?.error || "Failed to apply bulk action.";
      setError(message);
      showToast("error", message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Control Room"
        title="Scraped Tools Moderation"
        description="Review scraped submissions, filter by category, and approve or reject in one pass."
      />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Pending", value: pendingCount, tone: "text-cyan-200" },
          { label: "Visible", value: filteredTools.length, tone: "text-white" },
          { label: "Selected", value: selectedIds.length, tone: "text-amber-200" },
          { label: "Access", value: accessKey ? "Open" : "Locked", tone: "text-emerald-200" }
        ].map((item) => (
          <div key={item.label} className="glass-panel rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/45">{item.label}</p>
            <p className={`mt-3 font-display text-3xl font-semibold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            type="password"
            value={keyInput}
            onChange={(event) => setKeyInput(event.target.value)}
            placeholder="Enter admin access key"
            className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/45 focus:border-white/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void handleUnlock()}
            disabled={loading}
            className="rounded-full bg-aurora px-5 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking..." : "Unlock"}
          </button>
          <button
            type="button"
            onClick={clearStoredAccess}
            className="rounded-full border border-white/20 px-5 py-3 text-sm text-white/90"
          >
            Clear Key
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
      </section>

      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Pending Scraped Tools</h2>
            <p className="mt-2 text-sm text-white/65">
              Page {page} of {Math.max(1, totalPages || 1)}
            </p>
          </div>
          <div className="w-full lg:max-w-md">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search title, category, source, url..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategoryFilter(tab.key)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                categoryFilter === tab.key
                  ? "bg-cyan-300 text-slate-900"
                  : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={allVisibleSelected ? () => setSelectedIds([]) : selectVisible}
            disabled={!filteredTools.length}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {allVisibleSelected ? "Clear Visible" : "Select Visible"}
          </button>
          <button
            type="button"
            onClick={() => void applyBulkDecision("approved")}
            disabled={!selectedIds.length || actionLoading}
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Approve Selected
          </button>
          <button
            type="button"
            onClick={() => void applyBulkDecision("rejected")}
            disabled={!selectedIds.length || actionLoading}
            className="rounded-full bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reject Selected
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {!loading && filteredTools.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-white/70">
              No pending tools match the current filters.
            </div>
          ) : null}

          {filteredTools.map((tool) => {
            const hasImage = tool.image_url && !failedImageIds.includes(tool.id);

            return (
              <article
                key={tool.id}
                className={`rounded-3xl border p-5 transition ${
                  selectedIds.includes(tool.id) ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-black/20"
                }`}
              >
                <div className="grid gap-4 md:grid-cols-[168px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {hasImage ? (
                      <img
                        src={tool.image_url || ""}
                        alt={tool.title}
                        className="h-32 w-full object-cover"
                        loading="lazy"
                        onError={() => setFailedImageIds((previous) => [...previous, tool.id])}
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-white/10 via-white/5 to-transparent px-3 text-center text-xs text-white/60">
                        Preview unavailable
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl text-white">{tool.title}</h3>
                        <p className="mt-1 text-sm text-white/60">{trimSummary(tool.description)}</p>
                      </div>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                        {tool.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
                      <span>Source: {tool.source_site || safeDomainLabel(tool.webpage_url)}</span>
                      <span>Scraped: {new Date(tool.scraped_at).toLocaleString()}</span>
                    </div>

                    <a
                      href={tool.webpage_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-sm text-cyan-200 underline decoration-cyan-200/40 underline-offset-4 transition hover:text-cyan-100"
                    >
                      Open source URL
                    </a>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="flex items-center gap-2 text-sm text-white/80">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(tool.id)}
                          onChange={() => toggleId(tool.id)}
                          className="h-4 w-4 rounded border-white/25 bg-transparent text-cyan-300"
                        />
                        Select
                      </label>
                      <button
                        type="button"
                        onClick={() => void applySingleDecision(tool.id, "approved")}
                        disabled={actionLoading}
                        className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void applySingleDecision(tool.id, "rejected")}
                        disabled={actionLoading}
                        className="rounded-full bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
            disabled={page <= 1 || loading}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm text-white/65">
            {page} / {Math.max(1, totalPages || 1)}
          </p>
          <button
            type="button"
            onClick={() => setPage((previous) => previous + 1)}
            disabled={loading || (totalPages > 0 && page >= totalPages)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>

      {toast ? (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl border px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-lg ${
            toast.tone === "success"
              ? "border-emerald-300/40 bg-emerald-400/20"
              : "border-rose-300/40 bg-rose-400/20"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}