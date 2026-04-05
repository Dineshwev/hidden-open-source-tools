"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import api from "@/lib/api";

type PendingUpload = {
  id: string;
  title: string;
  category: {
    name: string;
  };
  uploader: {
    username: string;
    email: string;
  };
  status: "PENDING";
  createdAt: string;
  fileSize: number;
};

const ACCESS_KEY_STORAGE = "cloud_rain_admin_access_key";

export default function AdminModerationPanel() {
  const [keyInput, setKeyInput] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const fetchPending = useCallback(async (providedKey: string) => {
    if (!providedKey) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get<{ data: PendingUpload[] }>("/admin/pending-uploads", {
        headers: {
          "x-admin-access-key": providedKey
        }
      });

      setPendingUploads(response.data?.data || []);
    } catch (err: unknown) {
      const maybeError = err as { response?: { data?: { error?: string } } };
      const message = maybeError?.response?.data?.error || "Failed to load pending uploads.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

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
    void fetchPending(storedKey);
  }, [fetchPending]);

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    const trimmedKey = keyInput.trim();

    if (!trimmedKey) {
      setError("Enter your admin access key.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_KEY_STORAGE, trimmedKey);
    }

    setAccessKey(trimmedKey);
    await fetchPending(trimmedKey);
  };

  const clearStoredAccess = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_KEY_STORAGE);
    }
    setAccessKey("");
    setKeyInput("");
    setPendingUploads([]);
    setError("");
    setStatusMessage("");
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

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Private moderation"
        title="Admin queue"
        description="Use your admin access key to unlock and moderate pending uploads from this hidden panel."
      />

      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
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
        {statusMessage ? <p className="mt-3 text-sm text-emerald-300">{statusMessage}</p> : null}
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {metricCards.map(([value, label]) => (
          <div key={label} className="glass-panel rounded-3xl p-6">
            <p className="font-display text-3xl font-bold text-white">{value}</p>
            <p className="mt-2 text-sm text-white/60">{label}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-[2rem] p-8">
        <div className="grid gap-4">
          {!pendingUploads.length && accessKey ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-white/70">
              No pending uploads right now.
            </div>
          ) : null}

          {pendingUploads.map((row) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-5 md:grid-cols-[1.7fr_1fr_1fr_auto]"
            >
              <div>
                <h3 className="font-display text-xl text-white">{row.title}</h3>
                <p className="mt-1 text-sm text-white/60">{row.category.name}</p>
                <p className="mt-1 text-xs text-white/45">
                  {new Date(row.createdAt).toLocaleString()} • {(row.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className="text-sm text-white/70">
                <p>{row.uploader.username}</p>
                <p className="text-xs text-white/45">{row.uploader.email}</p>
              </div>
              <p className="text-sm text-amber-300">{row.status}</p>
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}