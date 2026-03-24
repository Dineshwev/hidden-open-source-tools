"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MysteryReward } from "@/store/mystery-store";

type TerminalEntry = {
  id: number;
  kind: "system" | "command" | "result" | "error";
  text: string;
};

type TerminalUnlockProps = {
  reward: MysteryReward;
  loading: boolean;
  onUnlock: () => Promise<void>;
};

const HELP_LINES = [
  "Available commands:",
  "/unlock [asset_id]",
  "/status",
  "/help"
];

function buildStatusLines(reward: MysteryReward, loading: boolean) {
  if (loading) {
    return ["STATUS: unlock pipeline busy", "Signal: decoding active", "Wait for current retrieval to finish."];
  }

  if (!reward) {
    return ["STATUS: idle", "No asset unlocked yet.", "Run /unlock [asset_id] to query the vault."];
  }

  return [
    `STATUS: asset unlocked`,
    `Asset: ${reward.title}`,
    `Rarity: ${reward.rarity}`,
    `Source: ${reward.category} by ${reward.uploader}`
  ];
}

function randomDecodeLine(length: number) {
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\[]{}";
  return Array.from({ length }, () => glyphs[Math.floor(Math.random() * glyphs.length)]).join("");
}

export default function TerminalUnlock({ reward, loading, onUnlock }: TerminalUnlockProps) {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<TerminalEntry[]>([
    { id: 1, kind: "system", text: "PORTFOLIO-UNIVERSE CLI v2.4.1" },
    { id: 2, kind: "system", text: "Vault node online. Type /help for command list." }
  ]);
  const [decoding, setDecoding] = useState(false);
  const [decodeFrame, setDecodeFrame] = useState("");
  const nextId = useRef(3);
  const viewportRef = useRef<HTMLDivElement>(null);

  const statusPreview = useMemo(() => buildStatusLines(reward, loading), [reward, loading]);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [history, decodeFrame]);

  useEffect(() => {
    if (!decoding) {
      return;
    }

    const interval = window.setInterval(() => {
      setDecodeFrame(`Decoding ${randomDecodeLine(18)}`);
    }, 70);

    return () => window.clearInterval(interval);
  }, [decoding]);

  function pushLines(kind: TerminalEntry["kind"], lines: string[]) {
    setHistory((current) => [
      ...current,
      ...lines.map((text) => ({
        id: nextId.current++,
        kind,
        text
      }))
    ]);
  }

  async function runCommand(rawCommand: string) {
    const trimmed = rawCommand.trim();
    if (!trimmed) {
      return;
    }

    pushLines("command", [`> ${trimmed}`]);
    const [baseCommand, argument] = trimmed.split(/\s+/, 2);
    const normalized = baseCommand.toLowerCase();

    if (normalized === "/help") {
      pushLines("result", HELP_LINES);
      return;
    }

    if (normalized === "/status") {
      pushLines("result", statusPreview);
      return;
    }

    if (normalized === "/unlock") {
      if (loading || decoding) {
        pushLines("error", ["Unlock request rejected: vault already processing another request."]);
        return;
      }

      setDecoding(true);
      pushLines("system", [
        `Target: ${argument ?? "RANDOM_ASSET"}`,
        "Handshake accepted. Beginning decode sequence..."
      ]);

      await new Promise((resolve) => window.setTimeout(resolve, 1450));
      setDecoding(false);

      try {
        await onUnlock();
        pushLines("result", reward
          ? [`Unlock synced: ${reward.title}`, `Rarity signal: ${reward.rarity}`]
          : ["Vault responded. Asset payload received."]);
      } catch {
        pushLines("error", ["Unlock failed. Retry connection or inspect marketplace API status."]);
      }

      return;
    }

    pushLines("error", [`Unknown command: ${trimmed}`, "Run /help to inspect available terminal actions."]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextCommand = command;
    setCommand("");
    await runCommand(nextCommand);
  }

  return (
    <section className="terminal-shell glass-panel relative overflow-hidden rounded-[2rem] p-0">
      <div className="terminal-scanlines pointer-events-none absolute inset-0" />
      <div className="relative flex items-center justify-between border-b border-[#7cffae]/15 px-5 py-4">
        <div>
          <p className="terminal-label text-xs uppercase tracking-[0.35em] text-[#7cffae]/70">Vault CLI</p>
          <p className="mt-2 text-sm text-[#7cffae]/55">Secondary command-line access for unlocks and status checks.</p>
        </div>
        <div className="rounded-full border border-[#7cffae]/20 bg-[#7cffae]/5 px-3 py-1 text-xs text-[#7cffae]/70">
          node: online
        </div>
      </div>

      <div ref={viewportRef} className="terminal-viewport relative h-[360px] overflow-y-auto px-5 py-5">
        {history.map((entry) => (
          <div key={entry.id} className="mb-2 flex gap-3 text-sm leading-6">
            <span className="terminal-prompt shrink-0 text-[#7cffae]/45">
              {entry.kind === "command" ? "$" : entry.kind === "error" ? "!" : ">"}
            </span>
            <span
              className={
                entry.kind === "error"
                  ? "text-[#ff8f8f]"
                  : entry.kind === "command"
                    ? "text-[#d3ffd1]"
                    : "text-[#7cffae]/80"
              }
            >
              {entry.text}
            </span>
          </div>
        ))}

        <AnimatePresence>
          {decoding ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3 flex gap-3 text-sm leading-6 text-[#7cffae]"
            >
              <span className="terminal-prompt shrink-0 text-[#7cffae]/45">&gt;</span>
              <span className="terminal-decoding">{decodeFrame || "Decoding..."}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="relative border-t border-[#7cffae]/15 px-5 py-4">
        <label className="sr-only" htmlFor="vault-cli-command">
          Terminal command
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-[#7cffae]/20 bg-black/55 px-4 py-3">
          <span className="terminal-prompt text-[#7cffae]/60">&gt;</span>
          <input
            id="vault-cli-command"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="Type /unlock asset_01 or /status"
            className="w-full bg-transparent text-sm text-[#bafeb7] outline-none placeholder:text-[#7cffae]/28"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </form>
    </section>
  );
}
