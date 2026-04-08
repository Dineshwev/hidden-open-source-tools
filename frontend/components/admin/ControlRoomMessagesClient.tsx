"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Mail,
  MessageSquare,
  MessageSquareReply,
  PencilLine,
  RefreshCw,
  Send,
  ShieldAlert,
  TimerReset,
  Trash2,
  UserRound,
  Undo2
} from "lucide-react";
import type { AdminReply, ContactMessage } from "@/lib/types/contact.types";

type AdminMessageRecord = ContactMessage & {
  reply: AdminReply | null;
};

type MessagesResponse = {
  success: boolean;
  data: AdminMessageRecord[];
  totalPages: number;
  count: number;
  currentPage: number;
  unreadCount: number;
  awaitingReplyCount: number;
};

type FilterKey = "all" | "unread" | "identified" | "anonymous" | "replied";

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET?.trim() || "";
const REFRESH_INTERVAL_MS = 60_000;

const filterTabs: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "identified", label: "Identified" },
  { key: "anonymous", label: "Anonymous" },
  { key: "replied", label: "Replied" }
];

export default function ControlRoomMessagesClient() {
  const [messages, setMessages] = useState<AdminMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [publicToggles, setPublicToggles] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [awaitingReplyCount, setAwaitingReplyCount] = useState(0);

  const adminHeaders = useMemo(
    () => ({
      Authorization: ADMIN_SECRET
    }),
    []
  );

  const showToast = useCallback((tone: "success" | "error", message: string) => {
    setToast({ tone, message });
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const fetchMessagesPage = useCallback(
    async (targetPage: number) => {
      if (!ADMIN_SECRET) {
        setError("Admin secret is not configured. Set NEXT_PUBLIC_ADMIN_SECRET.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<MessagesResponse>("/api/admin/messages", {
          params: {
            page: targetPage,
            limit: 8
          },
          headers: adminHeaders
        });

        return response.data;
      } catch (requestError: any) {
        throw new Error(requestError?.response?.data?.error || "Failed to load admin messages.");
      }
    },
    [adminHeaders]
  );

  const loadPage = useCallback(
    async (targetPage: number, replace = false) => {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError("");

      try {
        const payload = await fetchMessagesPage(targetPage);
        const incoming = Array.isArray(payload?.data) ? payload.data : [];

        setMessages((previous) => (replace ? incoming : dedupeMessages([...previous, ...incoming])));
        setPage(targetPage);
        setTotalPages(Math.max(1, payload?.totalPages || 1));
        setTotalCount(payload?.count || 0);
        setUnreadCount(payload?.unreadCount || 0);
        setAwaitingReplyCount(payload?.awaitingReplyCount || 0);
      } catch (loadError: any) {
        setError(loadError?.message || "Failed to load admin messages.");
        if (replace) {
          setMessages([]);
          setPage(1);
          setTotalPages(1);
          setTotalCount(0);
          setUnreadCount(0);
          setAwaitingReplyCount(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fetchMessagesPage]
  );

  const refreshVisiblePages = useCallback(async () => {
    if (page < 1) {
      return;
    }

    setLoadingMore(true);

    try {
      const pages = await Promise.all(Array.from({ length: page }, (_, index) => fetchMessagesPage(index + 1)));
      const merged = dedupeMessages(
        pages.flatMap((payload) => (Array.isArray(payload?.data) ? payload.data : []))
      );

      setMessages(merged);

      const latest = pages[0];
      if (latest) {
        setTotalPages(Math.max(1, latest.totalPages || 1));
        setTotalCount(latest.count || 0);
        setUnreadCount(latest.unreadCount || 0);
        setAwaitingReplyCount(latest.awaitingReplyCount || 0);
      }
    } catch {
      // Keep the current view; the next poll will try again.
    } finally {
      setLoadingMore(false);
    }
  }, [fetchMessagesPage, page]);

  useEffect(() => {
    void loadPage(1, true);

    const intervalId = window.setInterval(() => {
      void refreshVisiblePages();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadPage, refreshVisiblePages]);

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      if (filter === "unread") return !message.is_read;
      if (filter === "identified") return message.mode === "identified";
      if (filter === "anonymous") return message.mode === "anonymous";
      if (filter === "replied") return Boolean(message.reply);
      return true;
    });
  }, [filter, messages]);

  const updateMessage = useCallback((id: string, updater: (message: AdminMessageRecord) => AdminMessageRecord) => {
    setMessages((previous) => previous.map((message) => (message.id === id ? updater(message) : message)));
  }, []);

  const handleMarkAsRead = useCallback(
    async (messageId: string) => {
      updateMessage(messageId, (message) => ({ ...message, is_read: true }));

      try {
        await axios.post(`/api/admin/messages/${messageId}/read`, null, {
          headers: adminHeaders
        });
        void refreshVisiblePages();
        showToast("success", "Message marked as read.");
      } catch (markError: any) {
        updateMessage(messageId, (message) => ({ ...message, is_read: false }));
        showToast("error", markError?.response?.data?.error || "Unable to mark message as read.");
      }
    },
    [adminHeaders, refreshVisiblePages, showToast, updateMessage]
  );

  const handleReplyPost = useCallback(
    async (messageId: string) => {
      const replyText = (replyDrafts[messageId] || "").trim();

      if (!replyText) {
        showToast("error", "Please type a reply first.");
        return;
      }

      setActionLoadingId(messageId);

      const isPublic = Boolean(publicToggles[messageId]);
      const optimisticReply: AdminReply = {
        id: `temp-${Date.now()}`,
        message_id: messageId,
        reply_text: replyText,
        is_public: isPublic,
        created_at: new Date().toISOString(),
        helpful_count: 0
      };

      const previousSnapshot = messages;

      updateMessage(messageId, (message) => ({
        ...message,
        is_read: true,
        is_private: isPublic ? false : message.is_private,
        reply: optimisticReply
      }));

      try {
        const response = await axios.post(
          `/api/admin/messages/${messageId}/reply`,
          {
            reply_text: replyText,
            is_public: isPublic
          },
          {
            headers: adminHeaders
          }
        );

        const postedReply = response.data?.reply as AdminReply | undefined;

        if (postedReply) {
          updateMessage(messageId, (message) => ({
            ...message,
            is_read: true,
            is_private: isPublic ? false : message.is_private,
            reply: postedReply
          }));
        }

        setReplyDrafts((previous) => ({ ...previous, [messageId]: "" }));
        void refreshVisiblePages();
        showToast("success", "Reply posted.");
      } catch (replyError: any) {
        setMessages(previousSnapshot);
        showToast("error", replyError?.response?.data?.error || "Unable to post reply.");
      } finally {
        setActionLoadingId(null);
      }
    },
    [adminHeaders, messages, publicToggles, refreshVisiblePages, replyDrafts, showToast, updateMessage]
  );

  const unreadBadge = unreadCount > 0 ? `${unreadCount} Unread Messages` : "0 Unread Messages";

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_28%),linear-gradient(180deg,rgba(15,15,15,0.98),rgba(8,8,8,0.95))] p-6 md:p-8 lg:p-10">
        <div className="absolute inset-0 bg-grid-cyber opacity-25" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100">
              {unreadBadge}
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80">
              {totalCount} Total Messages
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80">
              {awaitingReplyCount} Awaiting Reply
            </div>
            {loadingMore ? (
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                Refreshing...
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Control Room</p>
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Messages</h1>
            <p className="max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              Monitor public and identified queries, mark items read, and publish replies directly from the admin queue.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filter === tab.key
              ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
              : "border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {error ? (
        <section className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
          {error}
        </section>
      ) : null}

      {loading && messages.length === 0 ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <MessageSkeleton key={`message-skeleton-${index}`} />
          ))}
        </div>
      ) : null}

      {!loading && filteredMessages.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-center md:p-10">
          <MessageSquare className="mx-auto h-12 w-12 text-white/40" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-white">No matching messages</h2>
          <p className="mt-2 text-sm leading-7 text-white/60">
            Try a different filter or wait for the next refresh cycle.
          </p>
        </section>
      ) : null}

      <section className="space-y-5">
        {filteredMessages.map((message, index) => (
          <MessageCard
            key={message.id}
            message={message}
            index={index}
            expanded={Boolean(expandedRows[message.id])}
            replyDraft={replyDrafts[message.id] || ""}
            makePublic={Boolean(publicToggles[message.id])}
            isLoading={actionLoadingId === message.id}
            onToggleExpanded={() =>
              setExpandedRows((previous) => ({
                ...previous,
                [message.id]: !previous[message.id]
              }))
            }
            onMarkAsRead={() => void handleMarkAsRead(message.id)}
            onReplyDraftChange={(value) =>
              setReplyDrafts((previous) => ({
                ...previous,
                [message.id]: value
              }))
            }
            onTogglePublic={() =>
              setPublicToggles((previous) => ({
                ...previous,
                [message.id]: !previous[message.id]
              }))
            }
            onReplyPost={() => void handleReplyPost(message.id)}
          />
        ))}
      </section>

      {messages.length > 0 ? (
        <section className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => void loadPage(page + 1, false)}
            disabled={page >= totalPages || loadingMore}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loadingMore ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {page >= totalPages ? "No More Messages" : loadingMore ? "Loading..." : "Load More"}
          </button>
        </section>
      ) : null}

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-md rounded-[1.5rem] border border-white/10 bg-[#090909]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl md:inset-x-auto md:right-6"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${toast.tone === "success" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"
                  }`}
              >
                {toast.tone === "success" ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{toast.tone === "success" ? "Success" : "Error"}</p>
                <p className="mt-1 text-sm leading-6 text-white/65">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MessageCard({
  message,
  index,
  expanded,
  replyDraft,
  makePublic,
  isLoading,
  onToggleExpanded,
  onMarkAsRead,
  onReplyDraftChange,
  onTogglePublic,
  onReplyPost
}: {
  message: AdminMessageRecord;
  index: number;
  expanded: boolean;
  replyDraft: string;
  makePublic: boolean;
  isLoading: boolean;
  onToggleExpanded: () => void;
  onMarkAsRead: () => void;
  onReplyDraftChange: (value: string) => void;
  onTogglePublic: () => void;
  onReplyPost: () => void;
}) {
  const replied = Boolean(message.reply);
  const statusPill = message.is_read ? "Read" : "Unread";

  return (
    <motion.article
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/55">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${message.is_read
              ? "border border-white/10 bg-white/[0.04]"
              : "border border-rose-400/20 bg-rose-400/10 text-rose-100"
              }`}
          >
            <span className={`h-2 w-2 rounded-full ${message.is_read ? "bg-white/45" : "bg-rose-400"}`} />
            {statusPill}
          </span>
          <span>•</span>
          <span>{message.mode === "anonymous" ? "Anonymous" : "Identified"}</span>
          <span>•</span>
          <span>{formatRelativeTime(message.created_at)}</span>
        </div>

        <div className="space-y-3">
          <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/82 md:text-base">
            {message.message}
          </p>

          {message.mode === "identified" ? (
            <div className="flex flex-wrap gap-3 text-sm">
              {message.social_handle ? (
                <Link
                  href={getSocialLink(message.social_handle)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <UserRound className="h-4 w-4" />
                  Twitter: {normalizeHandleLabel(message.social_handle)}
                </Link>
              ) : null}
              {message.email ? (
                <a
                  href={`mailto:${message.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <Mail className="h-4 w-4" />
                  {message.email}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onMarkAsRead}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
          >
            <Undo2 className="h-4 w-4" />
            Mark as Read
          </button>

          <button
            type="button"
            onClick={onToggleExpanded}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20"
          >
            <PencilLine className="h-4 w-4" />
            Reply
          </button>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/45">
              <MessageSquareReply className="h-4 w-4 text-white/60" />
              Reply Section
            </div>

            {replied ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${message.reply?.is_public
                  ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                  : "border border-slate-400/20 bg-slate-400/10 text-slate-100"
                  }`}
              >
                {message.reply?.is_public ? "Public ✅" : "Private 🔒"}
              </span>
            ) : null}
          </div>

          {replied && message.reply ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/80">
              {message.reply.reply_text}
            </div>
          ) : (
            <div className="mt-4 text-sm text-white/50">No reply posted yet.</div>
          )}

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <textarea
                  value={replyDraft}
                  onChange={(event) => onReplyDraftChange(event.target.value)}
                  rows={5}
                  placeholder="Type your reply..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/25 focus:bg-white/[0.06]"
                />

                <button
                  type="button"
                  onClick={onTogglePublic}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${makePublic
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                    : "border-white/10 bg-white/[0.04] text-white/80"
                    }`}
                >
                  <span>Make Public</span>
                  <span>{makePublic ? "✅" : "❌"}</span>
                </button>

                {makePublic ? (
                  <p className="text-xs text-white/45">If public, this reply shows on /general-queries.</p>
                ) : null}

                <button
                  type="button"
                  onClick={onReplyPost}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-white via-zinc-200 to-zinc-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Post Reply
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

function MessageSkeleton() {
  return (
    <div className="animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex gap-2">
        <div className="h-8 w-28 rounded-full bg-white/10" />
        <div className="h-8 w-32 rounded-full bg-white/10" />
        <div className="h-8 w-24 rounded-full bg-white/10" />
      </div>
      <div className="mt-5 h-24 rounded-2xl bg-white/10" />
      <div className="mt-4 h-16 rounded-2xl bg-white/10" />
      <div className="mt-4 h-40 rounded-[1.5rem] bg-white/10" />
    </div>
  );
}

function formatRelativeTime(value: string) {
  const createdAt = new Date(value).getTime();
  const diff = Date.now() - createdAt;
  const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function normalizeHandleLabel(handle: string) {
  return handle.startsWith("@") ? handle : `@${handle.replace(/^https?:\/\//, "")}`;
}

function getSocialLink(handle: string) {
  const raw = handle.trim();

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const normalized = raw.replace(/^@/, "");

  if (/github/i.test(raw)) {
    return `https://github.com/${normalized}`;
  }

  return `https://twitter.com/${normalized}`;
}

function dedupeMessages(messages: AdminMessageRecord[]) {
  const seen = new Set<string>();

  return messages.filter((message) => {
    if (seen.has(message.id)) {
      return false;
    }

    seen.add(message.id);
    return true;
  });
}