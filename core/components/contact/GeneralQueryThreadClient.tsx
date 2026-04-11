"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, Copy, Loader2, MessageSquareReply, ThumbsUp } from "lucide-react";
import type { AdminReply, PublicQueryThread } from "@/lib/types/contact.types";

type ThreadResponse = {
  success: boolean;
  data: PublicQueryThread[];
};

type NoticeState =
  | {
      title: string;
      message: string;
    }
  | null;

const HELPFUL_STORAGE_KEY = "cloud_rain_helpful_reactions";

export default function GeneralQueryThreadClient({ threadId }: { threadId: string }) {
  const [threadItems, setThreadItems] = useState<PublicQueryThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [helpfulIds, setHelpfulIds] = useState<string[]>([]);
  const [followUpValue, setFollowUpValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  const rootThread = threadItems[0] ?? null;
  const replyCount = useMemo(() => threadItems.filter((item) => Boolean(item.reply)).length, [threadItems]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(HELPFUL_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setHelpfulIds(parsed.filter((entry): entry is string => typeof entry === "string"));
      }
    } catch {
      window.localStorage.removeItem(HELPFUL_STORAGE_KEY);
    }
  }, []);

  const persistHelpfulIds = useCallback((nextIds: string[]) => {
    setHelpfulIds(nextIds);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HELPFUL_STORAGE_KEY, JSON.stringify(nextIds));
    }
  }, []);

  const loadThread = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get<ThreadResponse>(`/api/contact/queries/${threadId}`);
      const payload = response.data;
      setThreadItems(Array.isArray(payload.data) ? payload.data : []);
    } catch (threadError: any) {
      setError(threadError?.response?.data?.error || "Unable to load this query thread right now.");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  const handleHelpful = useCallback(
    async (replyId: string) => {
      if (helpfulIds.includes(replyId)) {
        return;
      }

      try {
        await axios.post("/api/contact/reactions", { reply_id: replyId, reaction: "helpful" });
        persistHelpfulIds([...helpfulIds, replyId]);
        setThreadItems((previous) =>
          previous.map((item) =>
            item.reply?.id === replyId
              ? {
                  ...item,
                  helpful_count: item.helpful_count + 1,
                  reply: item.reply
                    ? {
                        ...item.reply,
                        helpful_count: (item.reply.helpful_count || item.helpful_count) + 1
                      }
                    : item.reply
                }
              : item
          )
        );
      } catch (reactionError: any) {
        setError(reactionError?.response?.data?.error || "Unable to save your reaction right now.");
      }
    },
    [helpfulIds, persistHelpfulIds]
  );

  const handleSubmitFollowUp = useCallback(async () => {
    const followUpText = followUpValue.trim();
    if (!followUpText) {
      setError("Please enter a follow-up message before sending.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await axios.post("/api/contact", {
        message: followUpText,
        mode: "anonymous",
        thread_id: threadId
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Unable to send follow-up.");
      }

      setFollowUpValue("");
      setNotice({
        title: "Follow-up received",
        message: "✅ Message received! Check back by Sunday for reply ✅"
      });
    } catch (submitError: any) {
      setError(submitError?.response?.data?.error || submitError?.message || "Unable to send follow-up.");
    } finally {
      setSubmitting(false);
    }
  }, [followUpValue, threadId]);

  const handleCopyLink = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      setCopying(true);
      await window.navigator.clipboard.writeText(window.location.href);
      setNotice({
        title: "Link copied",
        message: "Share this thread with anyone you want to bring into the conversation."
      });
    } catch {
      setError("Unable to copy the link right now.");
    } finally {
      setCopying(false);
    }
  }, []);

  return (
    <div className="space-y-8 pb-10 md:space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_30%),linear-gradient(180deg,rgba(15,15,15,0.98),rgba(8,8,8,0.96))] p-6 md:p-8 lg:p-10">
        <div className="absolute inset-0 bg-grid-cyber opacity-25" />
        <div className="relative flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Shareable public thread
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl">General Query Thread</h1>
            <p className="max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              Follow the conversation for a single anonymous question, react to the answer, and continue the thread.
            </p>
          </div>
          <Link
            href="/general-queries"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to General Queries
          </Link>

          <button
            type="button"
            onClick={() => void handleCopyLink()}
            disabled={copying}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {copying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
            Copy Link
          </button>
        </div>
      </section>

      {error ? (
        <section className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
          {error}
        </section>
      ) : null}

      {loading ? (
        <div className="space-y-5">
          <ThreadSkeleton />
          <ThreadSkeleton />
        </div>
      ) : null}

      {!loading && !rootThread ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-center md:p-10">
          <h2 className="font-display text-2xl font-semibold text-white">Thread not found</h2>
          <p className="mt-2 text-sm leading-7 text-white/60">
            The requested public query could not be loaded.
          </p>
          <Link
            href="/general-queries"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-white via-zinc-200 to-zinc-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105"
          >
            Browse queries
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      ) : null}

      {!loading && rootThread ? (
        <div className="space-y-5">
          <ThreadCard
            thread={rootThread}
            helpfulIds={helpfulIds}
            onHelpful={handleHelpful}
          />

          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/45">
              <MessageSquareReply className="h-4 w-4 text-white/60" />
              Conversation
            </div>

            <div className="mt-4 space-y-4">
              {threadItems.slice(1).length > 0 ? (
                threadItems.slice(1).map((item, index) => (
                  <div key={item.message.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/45">Follow-up #{index + 1}</div>
                    <p className="mt-3 text-sm leading-7 text-white/80">{item.message.message}</p>
                    {item.reply ? (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.24em] text-white/45">Admin Reply</div>
                        <p className="mt-2 text-sm leading-7 text-white/75">
                          {item.reply.reply_text} <span className="text-white/45">- Admin</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => onHelpful(item.reply?.id || "")}
                          className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${helpfulIds.includes(item.reply.id)
                            ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                            : "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.07]"
                            }`}
                        >
                          <ThumbsUp className={`h-4 w-4 ${helpfulIds.includes(item.reply.id) ? "fill-current" : ""}`} />
                          Helpful ({item.reply.helpful_count || 0})
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 text-sm text-white/60">⏳ Answer coming soon... Expected by Sunday</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                  No follow-ups yet. Be the first to continue this thread.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="text-xs uppercase tracking-[0.28em] text-white/45">Continue this query</div>
            <textarea
              value={followUpValue}
              onChange={(event) => setFollowUpValue(event.target.value)}
              rows={5}
              placeholder="Ask a follow-up anonymously..."
              className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/25 focus:bg-white/[0.06]"
            />
            <button
              type="button"
              onClick={() => void handleSubmitFollowUp()}
              disabled={submitting}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-white via-zinc-200 to-zinc-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send Follow-up
            </button>
          </section>
        </div>
      ) : null}

      <AnimatePresence>
        {notice ? (
          <motion.div
            className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-md rounded-[1.5rem] border border-white/10 bg-[#090909]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl md:inset-x-auto md:right-6"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">{notice.title}</div>
                <p className="mt-1 text-sm leading-6 text-white/65">{notice.message}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ThreadCard({
  thread,
  helpfulIds,
  onHelpful
}: {
  thread: PublicQueryThread;
  helpfulIds: string[];
  onHelpful: (replyId: string) => void;
}) {
  const helpfulClicked = thread.reply ? helpfulIds.includes(thread.reply.id) : false;

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-white/55">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
          <MessageSquareReply className="h-4 w-4 text-white/70" />
          Anonymous Query
        </span>
        <span>•</span>
        <span>{formatRelativeTime(thread.message.created_at)}</span>
      </div>

      <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/80 md:text-base">
        {thread.message.message}
      </p>

      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
        <div className="text-xs uppercase tracking-[0.28em] text-white/45">Admin Reply</div>

        {thread.reply ? (
          <>
            <p className="mt-3 text-sm leading-7 text-white/75 md:text-base">
              {thread.reply.reply_text} <span className="text-white/45">- Admin</span>
            </p>
            <button
              type="button"
              onClick={() => onHelpful(thread.reply?.id || "")}
              className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${helpfulClicked
                ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                : "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.07]"
                }`}
            >
              <ThumbsUp className={`h-4 w-4 ${helpfulClicked ? "fill-current" : ""}`} />
              Helpful ({thread.reply.helpful_count || thread.helpful_count || 0})
            </button>
          </>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-white/60">
            <div>⏳ Answer coming soon...</div>
            <div className="text-white/45">Expected by Sunday</div>
          </div>
        )}
      </div>
    </section>
  );
}

function ThreadSkeleton() {
  return (
    <div className="animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="h-8 w-48 rounded-full bg-white/10" />
      <div className="mt-5 h-24 rounded-2xl bg-white/10" />
      <div className="mt-4 h-28 rounded-[1.5rem] bg-white/10" />
    </div>
  );
}

function formatRelativeTime(value: string) {
  const createdAt = new Date(value).getTime();
  const diff = Date.now() - createdAt;
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}