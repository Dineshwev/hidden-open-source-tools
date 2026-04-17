"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { RefreshCw } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import api from "@/lib/api";
import AdminVerification from "@/components/admin/AdminVerification";
import type { AdminUpdatePayload, PaginatedResponse, ScrapedTool, ToolCategory } from "@/lib/types/scraped-tools.types";

type PendingToolsResponse = PaginatedResponse<ScrapedTool> & {
  error?: string;
};

type ToastState = {
  tone: "success" | "error";
  message: string;
};

type SourceFilter = "all" | "open-source" | "scraped";

const SOURCE_FILTER_STORAGE = "cloud_rain_admin_source_filter";
const CATEGORY_FILTER_STORAGE = "cloud_rain_admin_category_filter";
const SEARCH_QUERY_STORAGE = "cloud_rain_admin_search_query";
const PAGE_SIZE = 12;
const OPEN_SOURCE_ID_PREFIX = "ost__";

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

function getOriginBadge(toolId: string) {
  if (toolId.startsWith(OPEN_SOURCE_ID_PREFIX)) {
    return {
      label: "Open Source",
      className: "border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
    };
  }

  return {
    label: "Scraped",
    className: "border-cyan-300/30 bg-cyan-300/15 text-cyan-100"
  };
}

function isSourceFilter(value: string): value is SourceFilter {
  return value === "all" || value === "open-source" || value === "scraped";
}

function isCategoryFilter(value: string): value is ToolCategory | "all" {
  return value === "all" || value === "ui-kit" || value === "course" || value === "template" || value === "ai-tool" || value === "ui-component" || value === "other";
}

export default function ScrapedToolsAdminPanel() {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationSecret, setVerificationSecret] = useState("");
  const [verifying, setVerifying] = useState(false);
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
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpPageInput, setJumpPageInput] = useState("");
  const [bulkNote, setBulkNote] = useState("");
  const [notesByToolId, setNotesByToolId] = useState<Record<string, string>>({});
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

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verificationSecret.trim()) return;

    setVerifying(true);
    try {
      const res = await axios.post("/api/admin/verify", { secret: verificationSecret });
      if (res.data.success) {
        setIsVerified(true);
        showToast("success", "Admin session verified.");
        sessionStorage.setItem("admin_secret_session", verificationSecret);
      } else {
        showToast("error", "Invalid admin secret.");
      }
    } catch (err: any) {
      showToast("error", err.response?.data?.error || "Verification failed");
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

  const loadPendingTools = useCallback(
    async (targetPage = page) => {
      if (!isVerified) {
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
            Authorization: verificationSecret
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
    [isVerified, verificationSecret, page]
  );

  useEffect(() => {
    if (!isVerified) return;

    const storedSourceFilter = localStorage.getItem(SOURCE_FILTER_STORAGE) || "all";
    const storedCategoryFilter = localStorage.getItem(CATEGORY_FILTER_STORAGE) || "all";
    const storedSearchQuery = localStorage.getItem(SEARCH_QUERY_STORAGE) || "";

    if (isSourceFilter(storedSourceFilter)) {
      setSourceFilter(storedSourceFilter);
    }

    if (isCategoryFilter(storedCategoryFilter)) {
      setCategoryFilter(storedCategoryFilter);
    }

    setSearchQuery(storedSearchQuery);

    void loadPendingTools(1);
  }, [isVerified, loadPendingTools]);

  useEffect(() => {
    localStorage.setItem(SOURCE_FILTER_STORAGE, sourceFilter);
  }, [sourceFilter]);

  useEffect(() => {
    localStorage.setItem(CATEGORY_FILTER_STORAGE, categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    localStorage.setItem(SEARCH_QUERY_STORAGE, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVerified) return;
    void loadPendingTools(page);
  }, [isVerified, page, loadPendingTools]);

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      const isOpenSource = tool.id.startsWith(OPEN_SOURCE_ID_PREFIX);

      if (sourceFilter === "open-source" && !isOpenSource) {
        return false;
      }

      if (sourceFilter === "scraped" && isOpenSource) {
        return false;
      }

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
  }, [tools, sourceFilter, categoryFilter, searchQuery]);

  const sourceTabs = useMemo(() => {
    const openSourceCount = tools.filter((tool) => tool.id.startsWith(OPEN_SOURCE_ID_PREFIX)).length;
    const scrapedCount = tools.length - openSourceCount;

    return [
      { key: "all" as const, label: "All", count: tools.length },
      { key: "open-source" as const, label: "Open Source", count: openSourceCount },
      { key: "scraped" as const, label: "Scraped", count: scrapedCount }
    ];
  }, [tools]);

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

  const clearStoredAccess = () => {
    setIsVerified(false);
    setVerificationSecret("");
    sessionStorage.removeItem("admin_secret_session");
    setTools([]);
    setSelectedIds([]);
    setPendingCount(0);
    setTotalPages(0);
    setPage(1);
    setError("");
    setToast(null);
  };

  const applySingleDecision = async (id: string, status: AdminUpdatePayload["status"]) => {
    if (!isVerified) {
      setError("Unlock the panel first.");
      return;
    }

    const note = notesByToolId[id]?.trim();
    const previousTools = tools;
    const nextTools = previousTools.filter((item) => item.id !== id);
    setActionLoading(true);
    setTools(nextTools);
    setSelectedIds((previous) => previous.filter((selectedId) => selectedId !== id));
    setPendingCount((previous) => Math.max(0, previous - 1));

    try {
      await api.patch(
        `/admin/scraped-tools/${id}`,
        { status, note: note || undefined },
        { headers: { Authorization: verificationSecret } }
      );

      setNotesByToolId((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });

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
    if (!isVerified) {
      setError("Unlock the panel first.");
      return;
    }

    if (!selectedIds.length) {
      setError("Select at least one tool first.");
      return;
    }

    const note = bulkNote.trim();
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
          status,
          note: note || undefined
        },
        { headers: { Authorization: verificationSecret } }
      );

      setBulkNote("");

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

  const handleJumpToPage = () => {
    const parsed = Number.parseInt(jumpPageInput, 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
      setError("Enter a valid page number.");
      return;
    }

    const maxPage = Math.max(1, totalPages || 1);
    const safePage = Math.min(parsed, maxPage);
    setError("");
    setPage(safePage);
    setJumpPageInput("");
  };

  if (!isVerified) {
    return (
      <AdminVerification
        onVerify={handleVerify}
        verifying={verifying}
        secret={verificationSecret}
        setSecret={setVerificationSecret}
        accentColor="cyan"
        title="Tools Moderation"
      />
    );
  }

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
          { label: "Access", value: "Secured", tone: "text-emerald-200" }
        ].map((item) => (
          <div key={item.label} className="glass-panel rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/45">{item.label}</p>
            <p className={`mt-3 font-display text-3xl font-semibold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white/75">
            Server-side admin session is active. All requests are securely authenticated.
          </div>
          <button
            type="button"
            onClick={() => void loadPendingTools(page)}
            disabled={loading}
            className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={clearStoredAccess}
            className="rounded-full border border-white/20 px-5 py-3 text-sm text-white/90"
          >
            Clear Session
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
      </section>

      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Pending Tools</h2>
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
          {sourceTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSourceFilter(tab.key)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                sourceFilter === tab.key
                  ? "bg-emerald-300 text-slate-900"
                  : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
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
          <input
            value={bulkNote}
            onChange={(event) => setBulkNote(event.target.value.slice(0, 500))}
            placeholder="Bulk moderation note (optional, up to 500 chars)"
            className="min-w-[280px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-cyan-300/40"
          />
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
          {loading && tools.length === 0 ? (
            <div className="flex justify-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
          ) : !loading && filteredTools.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-white/70">
              No pending tools match the current filters.
            </div>
          ) : null}

          {filteredTools.map((tool) => {
            const hasImage = tool.image_url && !failedImageIds.includes(tool.id);
            const originBadge = getOriginBadge(tool.id);

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
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${originBadge.className}`}
                          >
                            {originBadge.label}
                          </span>
                          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                            {tool.category}
                          </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
                      <span>Origin: {originBadge.label}</span>
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

                    {tool.moderation_note ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Last moderation note</p>
                        <p className="mt-1 whitespace-pre-wrap">{tool.moderation_note}</p>
                      </div>
                    ) : null}

                    <input
                      value={notesByToolId[tool.id] || ""}
                      onChange={(event) =>
                        setNotesByToolId((previous) => ({
                          ...previous,
                          [tool.id]: event.target.value.slice(0, 500)
                        }))
                      }
                      placeholder="Add a note before approve/reject (optional)"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-cyan-300/40"
                    />

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

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
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

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={loading || page === 1}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              First
            </button>

            <input
              type="number"
              min={1}
              max={Math.max(1, totalPages || 1)}
              value={jumpPageInput}
              onChange={(event) => setJumpPageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleJumpToPage();
                }
              }}
              placeholder="Go to page"
              className="w-32 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40"
            />

            <button
              type="button"
              onClick={handleJumpToPage}
              disabled={loading || !jumpPageInput.trim()}
              className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Go
            </button>

            <button
              type="button"
              onClick={() => setPage(Math.max(1, totalPages || 1))}
              disabled={loading || page >= Math.max(1, totalPages || 1)}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Last
            </button>
          </div>
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
