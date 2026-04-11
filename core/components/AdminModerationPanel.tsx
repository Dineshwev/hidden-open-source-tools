"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import api from "@/lib/api";

type Category = {
  id: string;
  name: string;
};

type UploadRecord = {
  id: string;
  title: string;
  category: {
    name: string;
  };
  uploader: {
    username: string;
    email: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string | null;
  fileSize: number;
};

type PendingUpload = UploadRecord;

type HealthState = {
  database: "checking" | "ready" | "down";
  adminApi: "idle" | "ready" | "error";
  detail: string;
  checkedAt: string | null;
};

type UploadDiagnostics = {
  urlPresent?: boolean;
  urlValid?: boolean;
  keyPresent?: boolean;
  keyValid?: boolean;
  keyHint?: string;
};

type UploadPreset = {
  label: string;
  title: string;
  description: string;
  tags: string;
  license: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  categoryName: string;
  previewImageUrl?: string;
};

const ACCESS_KEY_STORAGE = "cloud_rain_admin_access_key";

const uploadPresets: UploadPreset[] = [
  {
    label: "UI Kit",
    title: "Modern SaaS UI Kit",
    description: "A polished dashboard and landing page kit for fast product launches.",
    tags: "ui kit, dashboard, landing page",
    license: "CC BY 4.0",
    rarity: "RARE",
    categoryName: "Templates"
  },
  {
    label: "Free Course",
    title: "Free Next.js Crash Course Links",
    description: "A curated learning bundle with beginner-friendly resources and reference links.",
    tags: "course, learning, nextjs",
    license: "Free for community use",
    rarity: "COMMON",
    categoryName: "Tools"
  },
  {
    label: "Useful Tool",
    title: "Solo Developer Productivity Toolkit",
    description: "A compact toolbox with workflow helpers, checklists, and launch shortcuts.",
    tags: "tool, productivity, launch",
    license: "Internal / Community",
    rarity: "EPIC",
    categoryName: "Coding resources"
  }
];

export default function AdminModerationPanel() {
  const [keyInput, setKeyInput] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [approvedUploads, setApprovedUploads] = useState<PendingUpload[]>([]);
  const [rejectedUploads, setRejectedUploads] = useState<PendingUpload[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadStatusMessage, setUploadStatusMessage] = useState("");
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [uploadDiagnostics, setUploadDiagnostics] = useState<UploadDiagnostics | null>(null);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [healthState, setHealthState] = useState<HealthState>({
    database: "checking",
    adminApi: "idle",
    detail: "Checking platform services...",
    checkedAt: null
  });
  const uploadFormRef = useRef<HTMLFormElement | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get<{ data: Category[] }>("/categories");
      setCategories(response.data?.data || []);
      setHealthState((previous) => ({
        ...previous,
        database: "ready",
        detail: previous.adminApi === "error" ? previous.detail : "Database/API connection looks healthy.",
        checkedAt: new Date().toISOString()
      }));
    } catch {
      setCategories([]);
      setHealthState((previous) => ({
        ...previous,
        database: "down",
        detail: "Database/API is not reachable. Check DATABASE_URL and Supabase status.",
        checkedAt: new Date().toISOString()
      }));
    }
  }, []);

  const fetchPending = useCallback(async (providedKey: string) => {
    if (!providedKey) {
      return;
    }

    setLoading(true);
    setError("");
    setStatusMessage("Verifying access key...");

    try {
      const response = await api.get<{ data: PendingUpload[] }>("/admin/pending-uploads", {
        headers: {
          "x-admin-access-key": providedKey
        }
      });

      const loadedUploads = response.data?.data || [];
      setPendingUploads(loadedUploads);
      setSelectedIds((previous) => previous.filter((itemId) => loadedUploads.some((item) => item.id === itemId)));
      setStatusMessage(`Panel unlocked. Loaded ${loadedUploads.length} pending upload${loadedUploads.length === 1 ? "" : "s"}.`);
      setHealthState((previous) => ({
        ...previous,
        adminApi: "ready",
        detail: "Admin API is responding.",
        checkedAt: new Date().toISOString()
      }));
    } catch (err: unknown) {
      const maybeError = err as { response?: { data?: { error?: string } } };
      const message = maybeError?.response?.data?.error || "Failed to load pending uploads.";
      setError(message);
      setStatusMessage("");
      setHealthState((previous) => ({
        ...previous,
        adminApi: "error",
        detail: message,
        checkedAt: new Date().toISOString()
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  const runHealthCheck = useCallback(
    async (providedKey?: string) => {
      setHealthState((previous) => ({
        ...previous,
        database: "checking",
        detail: "Checking platform services...",
        checkedAt: new Date().toISOString()
      }));

      try {
        await api.get<{ data: Category[] }>("/categories");
        setHealthState((previous) => ({
          ...previous,
          database: "ready",
          detail: "Database/API connection looks healthy.",
          checkedAt: new Date().toISOString()
        }));
      } catch {
        setHealthState((previous) => ({
          ...previous,
          database: "down",
          adminApi: providedKey ? "error" : previous.adminApi,
          detail: "Database/API is not reachable. Check DATABASE_URL and Supabase status.",
          checkedAt: new Date().toISOString()
        }));
        return;
      }

      if (!providedKey) {
        setHealthState((previous) => ({
          ...previous,
          adminApi: "idle",
          detail: "Database/API is ready. Enter key to validate admin endpoint.",
          checkedAt: new Date().toISOString()
        }));
        return;
      }

      try {
        await api.get("/admin/pending-uploads", {
          headers: {
            "x-admin-access-key": providedKey
          }
        });
        setHealthState((previous) => ({
          ...previous,
          adminApi: "ready",
          detail: "Admin endpoint is ready.",
          checkedAt: new Date().toISOString()
        }));
      } catch (err: unknown) {
        const maybeError = err as { response?: { data?: { error?: string } } };
        const message = maybeError?.response?.data?.error || "Admin endpoint check failed.";
        setHealthState((previous) => ({
          ...previous,
          adminApi: "error",
          detail: message,
          checkedAt: new Date().toISOString()
        }));
      }
    },
    []
  );

  const fetchHistory = useCallback(
    async (providedKey: string, status: "APPROVED" | "REJECTED") => {
      try {
        const response = await api.get<{ data: PendingUpload[] }>("/admin/moderation-history", {
          headers: {
            "x-admin-access-key": providedKey
          },
          params: { status }
        });

        const loadedHistory = response.data?.data || [];
        if (status === "APPROVED") {
          setApprovedUploads(loadedHistory);
        } else {
          setRejectedUploads(loadedHistory);
        }
      } catch (err: unknown) {
        console.error(`Failed to load ${status.toLowerCase()} uploads:`, err);
        if (status === "APPROVED") {
          setApprovedUploads([]);
        } else {
          setRejectedUploads([]);
        }
      }
    },
    []
  );

  const unlockAndLoadAll = useCallback(
    async (providedKey: string) => {
      await fetchPending(providedKey);
      await Promise.all([
        fetchHistory(providedKey, "APPROVED"),
        fetchHistory(providedKey, "REJECTED")
      ]);
    },
    [fetchPending, fetchHistory]
  );

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void runHealthCheck();
  }, [runHealthCheck]);

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
    void unlockAndLoadAll(storedKey);
  }, [unlockAndLoadAll]);

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedKey = keyInput.trim();

    if (!trimmedKey) {
      setError("Enter your admin access key.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_KEY_STORAGE, trimmedKey);
    }

    setAccessKey(trimmedKey);
    await unlockAndLoadAll(trimmedKey);
  };

  const handleAdminUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessKey) {
      setError("Unlock the panel first before uploading.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    setUploadSubmitting(true);
    setUploadStatusMessage("Uploading file to Supabase...");
    setUploadErrorMessage("");
    setUploadDiagnostics(null);
    setError("");

    try {
      await api.post("/admin/uploads", formData, {
        headers: {
          "x-admin-access-key": accessKey,
          "Content-Type": "multipart/form-data"
        }
      });

      setUploadStatusMessage("File uploaded and marked pending for review.");
      setUploadErrorMessage("");
      setUploadDiagnostics(null);
      event.currentTarget.reset();
      await fetchPending(accessKey);
    } catch (err: unknown) {
      const maybeError = err as {
        response?: {
          data?: {
            error?: string;
            diagnostics?: UploadDiagnostics;
          };
        };
      };
      const message = maybeError?.response?.data?.error || "Admin upload failed.";
      setUploadStatusMessage("");
      setUploadErrorMessage(message);
      setUploadDiagnostics(maybeError?.response?.data?.diagnostics || null);
      setError(message);
    } finally {
      setUploadSubmitting(false);
    }
  };

  const setFormValue = (form: HTMLFormElement, fieldName: string, value: string) => {
    const field = form.elements.namedItem(fieldName);
    if (field && "value" in field) {
      field.value = value;
    }
  };

  const findCategoryId = (categoryName: string) => {
    return categories.find((category) => category.name === categoryName)?.id || categories[0]?.id || "";
  };

  const applyPreset = (preset: UploadPreset) => {
    const form = uploadFormRef.current;
    if (!form) return;

    setFormValue(form, "title", preset.title);
    setFormValue(form, "description", preset.description);
    setFormValue(form, "tags", preset.tags);
    setFormValue(form, "license", preset.license);
    setFormValue(form, "rarity", preset.rarity);
    setFormValue(form, "previewImageUrl", preset.previewImageUrl || "");

    const categoryId = findCategoryId(preset.categoryName);
    if (categoryId) {
      setFormValue(form, "categoryId", categoryId);
    }

    setUploadStatusMessage(`${preset.label} preset loaded.`);
  };

  const handleQuickTestUpload = async (preset: UploadPreset) => {
    if (!accessKey) {
      setError("Unlock the panel first before uploading.");
      return;
    }

    const categoryId = findCategoryId(preset.categoryName);
    if (!categoryId) {
      setError("No category available for this preset.");
      return;
    }

    const testFile = new File(
      [
        `Preset: ${preset.label}\n`,
        `Title: ${preset.title}\n`,
        `Description: ${preset.description}\n`,
        `Generated at: ${new Date().toISOString()}\n`
      ],
      `${preset.label.toLowerCase().replace(/\s+/g, "-")}-sample.txt`,
      { type: "text/plain" }
    );

    const formData = new FormData();
    formData.append("title", preset.title);
    formData.append("description", preset.description);
    formData.append("categoryId", categoryId);
    formData.append("tags", preset.tags);
    formData.append("license", preset.license);
    formData.append("rarity", preset.rarity);
    formData.append("previewImageUrl", preset.previewImageUrl || "");
    formData.append("file", testFile);

    setUploadSubmitting(true);
    setUploadStatusMessage(`Creating ${preset.label.toLowerCase()} test file...`);
    setError("");

    try {
      await api.post("/admin/uploads", formData, {
        headers: {
          "x-admin-access-key": accessKey,
          "Content-Type": "multipart/form-data"
        }
      });

      setUploadStatusMessage(`Test ${preset.label.toLowerCase()} uploaded and marked pending.`);
      await fetchPending(accessKey);
    } catch (err: unknown) {
      const maybeError = err as { response?: { data?: { error?: string } } };
      setUploadStatusMessage("");
      setError(maybeError?.response?.data?.error || "Admin upload failed.");
    } finally {
      setUploadSubmitting(false);
    }
  };

  const clearStoredAccess = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_KEY_STORAGE);
    }
    setAccessKey("");
    setKeyInput("");
    setPendingUploads([]);
    setApprovedUploads([]);
    setRejectedUploads([]);
    setUploadErrorMessage("");
    setUploadDiagnostics(null);
    setSelectedIds([]);
    setError("");
    setStatusMessage("");
  };

  const toggleSelection = (fileId: string) => {
    setSelectedIds((previous) =>
      previous.includes(fileId)
        ? previous.filter((itemId) => itemId !== fileId)
        : [...previous, fileId]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const moderateSelected = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedIds.length) {
      setError("Select at least one upload first.");
      return;
    }

    for (const fileId of selectedIds) {
      // Process items one by one so each moderation action is logged cleanly.
      await moderateUpload(fileId, status);
    }

    clearSelection();
  };

  const moderateUpload = async (fileId: string, status: "APPROVED" | "REJECTED") => {
    if (!accessKey) {
      setError("Admin access key is missing.");
      return;
    }

    setActiveFileId(fileId);
    setStatusMessage("");
    setError("");

    try {
      await api.patch(
        `/admin/pending-uploads/${fileId}`,
        { status },
        {
          headers: {
            "x-admin-access-key": accessKey
          }
        }
      );

      setPendingUploads((previous) => previous.filter((item) => item.id !== fileId));
      setStatusMessage(status === "APPROVED" ? "Upload approved." : "Upload rejected.");
      
      // Refetch history after moderation
      await fetchHistory(accessKey, "APPROVED");
      await fetchHistory(accessKey, "REJECTED");
    } catch (err: unknown) {
      const maybeError = err as { response?: { data?: { error?: string } } };
      const message = maybeError?.response?.data?.error || "Moderation request failed.";
      setError(message);
    } finally {
      setActiveFileId(null);
    }
  };

  const metricCards = useMemo(
    () => [
      [String(pendingUploads.length), "Pending uploads"],
      [accessKey ? "Active" : "Locked", "Access key status"],
      [loading ? "Syncing" : "Ready", "Panel state"]
    ],
    [pendingUploads.length, accessKey, loading]
  );

  const filteredPendingUploads = useMemo(() => {
    const sourceData =
      activeTab === "pending"
        ? pendingUploads
        : activeTab === "approved"
          ? approvedUploads
          : rejectedUploads;

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return sourceData;
    }

    return sourceData.filter((item) => {
      return [item.title, item.category.name, item.uploader.username, item.uploader.email]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [pendingUploads, approvedUploads, rejectedUploads, searchQuery, activeTab]);

  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTypingField) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "escape") {
        clearSelection();
        return;
      }

      if (key === "a") {
        event.preventDefault();
        setSelectedIds(filteredPendingUploads.map((item) => item.id));
        return;
      }

      if ((key === "p" || key === "r") && selectedIds.length) {
        event.preventDefault();
        void moderateSelected(key === "p" ? "APPROVED" : "REJECTED");
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => window.removeEventListener("keydown", handleKeyboardShortcuts);
  }, [filteredPendingUploads, moderateSelected, selectedIds.length]);

  const sidebarItems = [
    { label: "Upload", href: "#admin-upload" },
    { label: "Queue", href: "#admin-queue" },
    { label: "Access", href: "#admin-access" },
    { label: "Presets", href: "#admin-presets" }
  ];

  const queueSummary = useMemo(() => {
    const total = pendingUploads.length;
    return {
      total,
      selected: selectedIds.length,
      visible: filteredPendingUploads.length
    };
  }, [pendingUploads.length, selectedIds.length, filteredPendingUploads.length]);

  const statusToneClass = pendingUploads.length > 0 ? "text-amber-300" : "text-white/55";

  const tabCounts = {
    pending: pendingUploads.length,
    approved: approvedUploads.length,
    rejected: rejectedUploads.length
  };

  const exportQueueCsv = () => {
    const rows = filteredPendingUploads.map((item) => [
      item.id,
      item.title,
      item.category.name,
      item.uploader.username,
      item.uploader.email,
      item.status,
      item.createdAt,
      String(item.fileSize)
    ]);

    const csv = [
      ["id", "title", "category", "uploader", "email", "status", "createdAt", "fileSize"],
      ...rows
    ]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="glass-panel sticky top-6 h-fit rounded-[2rem] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">Control Room</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-white">Solo Admin Desk</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Quick actions for upload, review, and queue management.
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {sidebarItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Queue Snapshot</p>
          <p className="mt-3 text-3xl font-bold text-white">{pendingUploads.length}</p>
          <p className="text-sm text-white/60">Pending items</p>
        </div>
      </aside>

      <div className="space-y-8">
        <SectionHeading
          eyebrow="Private moderation"
          title="Admin queue"
          description="Use your admin access key to unlock and moderate pending uploads from this hidden panel."
        />

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Pending", value: pendingUploads.length, tone: "text-cyan-200" },
            { label: "Selected", value: selectedIds.length, tone: "text-white" },
            { label: "Upload Presets", value: uploadPresets.length, tone: "text-emerald-200" },
            { label: "Access", value: accessKey ? "Open" : "Locked", tone: "text-amber-200" }
          ].map((item) => (
            <div key={item.label} className="glass-panel rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">{item.label}</p>
              <p className={`mt-3 font-display text-3xl font-semibold ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </section>

        <section id="admin-upload" className="glass-panel rounded-[2rem] p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold text-white">Admin Upload</h2>
          <p className="mt-2 text-sm text-white/65">Upload a file here and it will enter the same pending queue for approval.</p>

          <div id="admin-presets" className="mt-5 flex flex-wrap gap-3">
            {uploadPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
              >
                Load {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void handleQuickTestUpload(uploadPresets[0])}
              className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-300/15"
              disabled={uploadSubmitting}
            >
              Quick Test Upload
            </button>
          </div>

          <form ref={uploadFormRef} className="mt-6 space-y-5" onSubmit={handleAdminUpload}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-white/75">Title</span>
              <input
                required
                name="title"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
                placeholder="Admin uploaded UI kit"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/75">Category</span>
              <select
                required
                name="categoryId"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
                defaultValue=""
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm text-white/75">Description</span>
            <textarea
              required
              name="description"
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
              placeholder="Describe what this file contains."
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-white/75">Tags</span>
              <input
                required
                name="tags"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
                placeholder="ui kit, template, design"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/75">License</span>
              <input
                required
                name="license"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
                placeholder="CC BY 4.0"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-white/75">Rarity</span>
              <select
                name="rarity"
                defaultValue="COMMON"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
              >
                <option value="COMMON">Common</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="LEGENDARY">Legendary</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/75">Preview image URL</span>
              <input
                name="previewImageUrl"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
                placeholder="https://example.com/preview.png"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm text-white/75">Upload file</span>
            <input
              required
              type="file"
              name="file"
              className="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-4 text-sm"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-white/65">{uploadStatusMessage || "This file will be stored in Supabase and added as PENDING."}</p>
            <button
              type="submit"
              disabled={uploadSubmitting}
              className="rounded-full bg-gradient-to-r from-nebula-500 to-ember px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadSubmitting ? "Uploading..." : "Upload File"}
            </button>
          </div>

          {uploadErrorMessage ? (
            <div className="mt-4 rounded-2xl border border-rose-300/35 bg-rose-400/10 p-4 text-sm text-rose-100">
              <p className="font-semibold">Upload failed</p>
              <p className="mt-1">{uploadErrorMessage}</p>
              {uploadDiagnostics ? (
                <ul className="mt-3 space-y-1 text-xs text-rose-100/90">
                  <li>URL present: {String(!!uploadDiagnostics.urlPresent)}</li>
                  <li>URL valid: {String(!!uploadDiagnostics.urlValid)}</li>
                  <li>Service key present: {String(!!uploadDiagnostics.keyPresent)}</li>
                  <li>Service key valid: {String(!!uploadDiagnostics.keyValid)}</li>
                  <li>Hint: {uploadDiagnostics.keyHint || "No hint provided."}</li>
                </ul>
              ) : null}
            </div>
          ) : null}
          </form>

        </section>

        <section id="admin-access" className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div
            className={`mb-4 rounded-2xl border p-4 text-sm ${
              healthState.database === "down"
                ? "border-rose-300/40 bg-rose-400/10 text-rose-100"
                : healthState.database === "checking"
                  ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                  : "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
            }`}
          >
            <p className="font-semibold">Service health</p>
            <p className="mt-1 text-white/90">{healthState.detail}</p>
            <p className="mt-2 text-xs text-white/70">
              Database: {healthState.database} · Admin API: {healthState.adminApi}
              {healthState.checkedAt ? ` · Checked ${new Date(healthState.checkedAt).toLocaleTimeString()}` : ""}
            </p>
            <button
              type="button"
              onClick={() => void runHealthCheck(accessKey || keyInput.trim() || undefined)}
              className="mt-3 rounded-full border border-white/20 px-4 py-2 text-xs text-white/90 transition hover:bg-white/10"
            >
              Re-check services
            </button>
          </div>

          <form className="grid gap-3 md:grid-cols-[1fr_auto_auto]" onSubmit={handleUnlock}>
            <input
              type="password"
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              placeholder="Enter admin access key"
              className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/45 focus:border-aurora focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-aurora px-5 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Checking..." : "Unlock Panel"}
            </button>
            <button
              type="button"
              onClick={clearStoredAccess}
              className="rounded-full border border-white/20 px-5 py-3 text-sm text-white/90"
            >
              Clear Key
            </button>
          </form>

          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
          {statusMessage ? <p className={`mt-3 text-sm ${statusToneClass}`}>{statusMessage}</p> : null}
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {metricCards.map(([value, label]) => (
            <div key={label} className="glass-panel rounded-3xl p-6">
              <p className="font-display text-3xl font-bold text-white">{value}</p>
              <p className="mt-2 text-sm text-white/60">{label}</p>
            </div>
          ))}
        </section>

        <section id="admin-queue" className="glass-panel rounded-[2rem] p-8">
          {activeTab === "pending" && (
            <div className="sticky top-4 z-10 -mx-2 mb-6 rounded-[1.5rem] border border-white/10 bg-slate-950/85 px-4 py-4 backdrop-blur-xl md:-mx-4 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/75">Queue Commander</p>
                  <p className="mt-1 text-sm text-white/65">
                    {queueSummary.visible} visible · {queueSummary.selected} selected · {queueSummary.total} total pending
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedIds(filteredPendingUploads.map((item) => item.id))}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                    disabled={!filteredPendingUploads.length}
                  >
                    Select all visible
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                    disabled={!selectedIds.length}
                  >
                    Clear selection
                  </button>
                  <button
                    type="button"
                    onClick={() => void moderateSelected("APPROVED")}
                    className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedIds.length}
                  >
                    Approve selected
                  </button>
                  <button
                    type="button"
                    onClick={() => void moderateSelected("REJECTED")}
                    className="rounded-full bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedIds.length}
                  >
                    Reject selected
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Esc clears selection</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">A selects visible rows</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">P approves selected</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">R rejects selected</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-white">
                {activeTab === "pending"
                  ? "Pending Uploads"
                  : activeTab === "approved"
                    ? "Approved History"
                    : "Rejected History"}
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Showing {filteredPendingUploads.length} of {tabCounts[activeTab]} {activeTab} uploads.
              </p>
            </div>
            <div className="w-full md:max-w-sm">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title, category, creator..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {(["pending", "approved", "rejected"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? "bg-cyan-300 text-slate-900" : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tabCounts[tab]})
              </button>
            ))}
            <button
              type="button"
              onClick={exportQueueCsv}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
              disabled={!filteredPendingUploads.length}
            >
              Export CSV
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {!filteredPendingUploads.length && accessKey ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-white/70">
                No pending uploads match your search.
              </div>
            ) : null}

            {filteredPendingUploads.map((row) => (
              <div
                key={row.id}
                className={`grid gap-3 rounded-3xl border p-5 md:grid-cols-[1.7fr_1fr_1fr_auto] ${selectedIds.includes(row.id) ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-black/20"}`}
              >
                <div className="flex items-start gap-3 md:col-span-4">
                  {activeTab === "pending" && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelection(row.id)}
                      className="mt-1 h-4 w-4 rounded border-white/25 bg-transparent text-cyan-300"
                    />
                  )}
                  <div className="flex-1 grid gap-3 md:grid-cols-[1.7fr_1fr_1fr_auto]">
                    <div>
                      <h3 className="font-display text-xl text-white">{row.title}</h3>
                      <p className="mt-1 text-sm text-white/60">{row.category.name}</p>
                      <p className="mt-1 text-xs text-white/45">
                        {new Date(row.createdAt).toLocaleString()} • {(row.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      {row.reviewedAt && (
                        <p className="mt-2 text-xs text-white/45">
                          Reviewed: {new Date(row.reviewedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-white/70">
                      <p>{row.uploader.username}</p>
                      <p className="text-xs text-white/45">{row.uploader.email}</p>
                    </div>
                    <p className={`text-sm ${activeTab === "pending" ? "text-amber-300" : activeTab === "approved" ? "text-emerald-300" : "text-rose-300"}`}>
                      {activeTab === "pending" ? "Pending" : activeTab === "approved" ? "Approved" : "Rejected"}
                    </p>
                    {activeTab === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => void moderateUpload(row.id, "APPROVED")}
                          className="rounded-full bg-aurora px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={activeFileId === row.id}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void moderateUpload(row.id, "REJECTED")}
                          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={activeFileId === row.id}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}