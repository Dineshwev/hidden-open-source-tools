"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageSquareReply,
  SmilePlus,
  ThumbsUp
} from "lucide-react";
import type { AdminReply, ContactMessage, PublicQueryThread } from "@/lib/types/contact.types";

type QueriesResponse = {
  success: boolean;
  data: PublicQueryThread[];
  totalPages: number;
  count: number;
};

type NoticeState =
  | {
      title: string;
      message: string;
    }
  | null;

const PAGE_SIZE = 6;
const HELPFUL_STORAGE_KEY = "cloud_rain_helpful_reactions";

export default function GeneralQueriesClient() {
  const [queries, setQueries] = useState<PublicQueryThread[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [helpfulIds, setHelpfulIds] = useState<string[]>([]);
  const [followUpValues, setFollowUpValues] = useState<Record<string, string>>({});
  const [submittingThreadId, setSubmittingThreadId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);

  const hasMore = page < totalPages;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(HELPFUL_STORAGE_KEY);
      if (!stored) {
        return;
      }

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

  const loadQueries = useCallback(
    async (targetPage: number, replace = false) => {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError("");

      try {
        const response = await axios.get<QueriesResponse>("/api/contact/queries", {
          params: {
            page: targetPage,
            limit: PAGE_SIZE
          }
        });

        const payload = response.data;
        const incoming = Array.isArray(payload.data) ? payload.data : [];

        setQueries((previous) => (replace ? incoming : [...previous, ...incoming]));
        setPage(targetPage);
        setTotalPages(Math.max(1, payload.totalPages || 1));
      } catch (err: unknown) {
        const maybeError = err as { response?: { data?: { error?: string } } };
        setError(maybeError?.response?.data?.error || "Unable to load public queries right now.");
        if (replace) {
          setQueries([]);
          setTotalPages(1);
          setPage(1);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadQueries(1, true);
  }, [loadQueries]);

  const handleHelpful = useCallback(
    async (replyId: string) => {
      if (helpfulIds.includes(replyId)) {
        return;
      }

      try {
        await axios.post("/api/contact/reactions", {
          reply_id: replyId,
          reaction: "helpful"
        });

        persistHelpfulIds([...helpfulIds, replyId]);
        setQueries((previous) =>
          previous.map((thread) =>
            thread.reply?.id === replyId
              ? {
                  ...thread,
                  helpful_count: thread.helpful_count + 1,
                  reply: thread.reply
                    ? {
                        ...thread.reply,
                        helpful_count: (thread.reply.helpful_count || thread.helpful_count) + 1
                      }
                    : thread.reply
                }
              : thread
          )
        );
      } catch (reactionError: any) {
        setError(reactionError?.response?.data?.error || "Unable to save your reaction right now.");
      }
    },
    [helpfulIds, persistHelpfulIds]
  );

  const handleFollowUpChange = useCallback((messageId: string, value: string) => {
    setFollowUpValues((previous) => ({
      ...previous,
      [messageId]: value
    }));
  }, []);

  const handleFollowUpSubmit = useCallback(
    async (threadId: string) => {
      const followUpText = (followUpValues[threadId] || "").trim();

      if (!followUpText) {
        setError("Please enter a follow-up message before sending.");
        return;
      }

      setSubmittingThreadId(threadId);
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

        setFollowUpValues((previous) => ({
          ...previous,
          [threadId]: ""
        }));

        setNotice({
          title: "Follow-up received",
          message: "✅ Message received! Check back by Sunday for reply ✅"
        });
      } catch (submitError: any) {
        setError(submitError?.response?.data?.error || submitError?.message || "Unable to send follow-up.");
      } finally {
        setSubmittingThreadId(null);
      }
    },
    [followUpValues]
  );

  const renderSkeletons = loading && queries.length === 0;

  const emptyState = !loading && queries.length === 0;

  const totalCount = useMemo(() => queries.length, [queries.length]);

  return (
    <div className="space-y-10 pb-10 md:space-y-12">
      <section className="mb-10 pt-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Community</p>
        <h1 className="mt-2 font-display text-4xl text-white">
          General Queries
        </h1>
        <p className="mt-3 text-white/60">
          Anonymous questions answered publicly to help the whole developer community.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.14)]" />
          Updated every Sunday
        </div>
      </section>

      {error ? (
        <section className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
          {error}
        </section>
      ) : null}

      <section className="space-y-5">
        {renderSkeletons ? (
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <QuerySkeleton key={`query-skeleton-${index}`} />
            ))}
          </div>
        ) : null}

        {!renderSkeletons ? (
          <div className="space-y-5">
            {queries.map((thread, index) => (
              <QueryCard
                key={thread.message.id}
                thread={thread}
                index={index}
                helpfulIds={helpfulIds}
                followUpValue={followUpValues[thread.message.id] || ""}
                isSubmitting={submittingThreadId === thread.message.id}
                onHelpful={handleHelpful}
                onFollowUpChange={handleFollowUpChange}
                onFollowUpSubmit={handleFollowUpSubmit}
              />
            ))}
          </div>
        ) : null}

        {emptyState ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-center md:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70">
              <SmilePlus className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-white">No public queries yet. Be the first to ask!</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/60">
              Start the first anonymous discussion and help shape the next community answer.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-white via-zinc-200 to-zinc-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105"
            >
              Ask a question
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </section>

      {queries.length > 0 ? (
        <section className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => void loadQueries(page + 1, false)}
            disabled={!hasMore || loadingMore}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loadingMore ? "Loading..." : hasMore ? "Load More" : "No More Queries"}
          </button>
        </section>
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

                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/[0.08]"
                  onClick={() => setNotice(null)}
                >
                  Back to Contact
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function timeAgo(value: string) {
  const createdAt = new Date(value).getTime();
  const delta = Date.now() - createdAt;
  const days = Math.max(0, Math.floor(delta / (1000 * 60 * 60 * 24)));

  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function QueryCard({
  thread,
  index,
  helpfulIds,
  followUpValue,
  isSubmitting,
  onHelpful,
  onFollowUpChange,
  onFollowUpSubmit
}: {
  thread: PublicQueryThread;
  index: number;
  helpfulIds: string[];
  followUpValue: string;
  isSubmitting: boolean;
  onHelpful: (replyId: string) => void;
  onFollowUpChange: (messageId: string, value: string) => void;
  onFollowUpSubmit: (messageId: string) => void;
}) {
  const hasReply = Boolean(thread.reply);
  const helpfulClicked = thread.reply ? helpfulIds.includes(thread.reply.id) : false;
  const displayReply = thread.reply as AdminReply | null;

  return (
    <motion.article
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/55">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            <MessageSquareReply className="h-4 w-4 text-white/70" />
            Anonymous Query
          </span>
          <span>•</span>
          <span>{timeAgo(thread.message.created_at)}</span>
        </div>

        <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/80 md:text-base">
          “{thread.message.message}”
        </p>

        <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.28em] text-white/45">Admin Reply</div>

          {hasReply && displayReply ? (
            <>
              <p className="text-sm leading-7 text-white/75 md:text-base">
                “{displayReply.reply_text}” <span className="text-white/45">- Admin</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onHelpful(displayReply.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${helpfulClicked
                    ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                    : "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.07]"
                    }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${helpfulClicked ? "fill-current" : ""}`} />
                  Helpful ({displayReply.helpful_count || thread.helpful_count || 0})
                </button>

                <span className="text-xs uppercase tracking-[0.24em] text-white/35">Public reaction count shown above</span>
              </div>
            </>
          ) : (
            <div className="space-y-2 text-sm text-white/60">
              <div>⏳ Answer coming soon...</div>
              <div className="text-white/45">Expected by Sunday</div>
            </div>
          )}

          <Link
            href={`/general-queries/${thread.message.id}`}
            className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            View thread
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-4">
          <div className="text-xs uppercase tracking-[0.28em] text-white/45">Continue this query</div>

          <textarea
            rows={4}
            value={followUpValue}
            onChange={(event) => onFollowUpChange(thread.message.id, event.target.value)}
            placeholder="Ask a follow-up anonymously..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/25 focus:bg-white/[0.06] resize-none"
          />

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onFollowUpSubmit(thread.message.id)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-white via-zinc-200 to-zinc-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send Follow-up
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function QuerySkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-8 w-40 rounded-full bg-white/10" />
        <div className="h-4 w-16 rounded bg-white/10" />
        <div className="h-4 w-20 rounded bg-white/10" />
      </div>
      <div className="mt-5 h-24 rounded-2xl bg-white/10" />
      <div className="mt-5 h-28 rounded-[1.5rem] bg-white/10" />
      <div className="mt-5 h-28 rounded-[1.5rem] bg-white/10" />
    </div>
  );
}

