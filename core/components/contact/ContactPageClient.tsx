"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Github,
  Loader2,
  Mail,
  MessageSquareText,
  Send,
  ShieldCheck,
  Twitter,
  UserRound
} from "lucide-react";

type ContactMode = "identified" | "anonymous";

type NoticeState =
  | {
      kind: "identified";
      title: string;
      message: string;
    }
  | {
      kind: "anonymous";
      title: string;
      message: string;
    };

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/25 focus:bg-white/[0.06] focus:ring-0";

export default function ContactPageClient() {
  const [mode, setMode] = useState<ContactMode>("identified");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Please enter a message before sending.");
      return;
    }

    if (mode === "identified" && !handle.trim()) {
      setError("Your Twitter/GitHub handle is required for identified messages.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message.trim(),
          mode,
          social_handle: handle.trim() || undefined,
          email: email.trim() || undefined
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || "Something went wrong while sending your message.");
      }

      setMessage("");
      setHandle("");
      setEmail("");

      if (mode === "identified") {
        setNotice({
          kind: "identified",
          title: "Message sent",
          message: "We\'ll reply to your handle/email privately ✅"
        });
      } else {
        setNotice({
          kind: "anonymous",
          title: "Message received",
          message: "✅ Message received! Check General Queries page by Sunday for your answer."
        });
      }
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to send your message right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10 md:space-y-14">
      <section className="mb-10 pt-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Support & Community</p>
        <h1 className="mt-2 font-display text-4xl text-white">
          Contact Dinesh
        </h1>
        <p className="mt-3 text-white/60 max-w-2xl text-lg">
          Reach out with a verified profile or stay anonymous. Identified messages get a private reply, while anonymous queries are shared publicly for the community.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(34,197,94,0.16)]" />
            No account required
          </div>
          <div className="text-sm text-white/40">
            Typical response: 24-48 hours
          </div>
        </div>
      </section>

            <div className="flex flex-wrap gap-3">
              <Link
                href="https://github.com/Dineshwev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <Github className="h-4 w-4" />
                GitHub verified
              </Link>
              <Link
                href="https://github.com/Dineshwev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <Github className="h-4 w-4" />
                GitHub Profile
              </Link>
            </div>
          </div>

          <motion.div
            className="depth-panel relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
            initial={{ opacity: 0, scale: 0.96, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Verified support channel</div>
                  <div className="text-xs text-white/45">Direct and community-friendly responses</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                    <UserRound className="h-4 w-4 text-white/60" />
                    Dinesh
                  </div>
                  <div className="text-sm text-white/75">
                    Platform owner and primary contact for resource, support, and collaboration inquiries.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                    <MessageSquareText className="h-4 w-4 text-white/60" />
                    Support style
                  </div>
                  <div className="text-sm text-white/75">
                    Identified messages receive private responses. Anonymous notes may be published publicly.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Contact</p>
            <h2 className="font-display text-3xl font-semibold text-white">Get In Touch</h2>
            <p className="max-w-md text-sm leading-7 text-white/60">
              Choose how you want to reach out. The form keeps the experience simple whether you want a private
              reply or a public answer for the whole community.
            </p>
          </div>

          <div className="grid gap-3">
            <ModeButton
              active={mode === "identified"}
              title="👤 With Details"
              description="Use your handle or email for a private response."
              onClick={() => setMode("identified")}
            />
            <ModeButton
              active={mode === "anonymous"}
              title="🕵️ Stay Anonymous"
              description="Send a question without sharing your identity."
              onClick={() => setMode("anonymous")}
            />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5 md:p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === "identified" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80" htmlFor="handle">
                    Your Twitter/GitHub handle
                  </label>
                  <input
                    id="handle"
                    type="text"
                    required
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                    placeholder="@dineshwev or github.com/Dineshwev"
                    className={fieldClassName}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80" htmlFor="email">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className={fieldClassName}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80" htmlFor="message">
                    Your message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tell us what you need help with..."
                    className={`${fieldClassName} resize-none`}
                  />
                </div>

                <SubmitButton loading={loading} label="Send Message" icon={Send} />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80" htmlFor="anonymous-message">
                    Your message
                  </label>
                  <textarea
                    id="anonymous-message"
                    required
                    rows={8}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Share your question anonymously..."
                    className={`${fieldClassName} resize-none`}
                  />
                </div>

                <SubmitButton loading={loading} label="Send Anonymously" icon={Mail} />
              </>
            )}

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {mode === "identified" && notice?.kind === "identified" ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {notice.message}
              </div>
            ) : null}
          </form>
        </div>
      </motion.section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-6 py-5 text-center md:px-8">
        <p className="mx-auto max-w-3xl text-sm leading-7 text-white/55">
          Anonymous queries are answered publicly on our General Queries page to help the community. Identified
          messages receive private responses.
        </p>
      </section>

      <AnimatePresence>
        {mode === "anonymous" && notice?.kind === "anonymous" ? (
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
                  href="/general-queries"
                  className="mt-4 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  View General Queries
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

function ModeButton({
  active,
  title,
  description,
  onClick
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition ${
        active
          ? "border-white/20 bg-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm leading-6 text-white/55">{description}</div>
    </motion.button>
  );
}

function SubmitButton({
  loading,
  label,
  icon: Icon
}: {
  loading: boolean;
  label: string;
  icon: typeof Send;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-white via-zinc-200 to-zinc-300 px-5 py-3.5 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}

function ClockPill() {
  return <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.12)]" />;
}

