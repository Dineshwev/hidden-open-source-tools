"use client";

import { FormEvent, useState } from "react";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const [message, setMessage] = useState("Use your account to access uploads and dashboard tools.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const response = await api.post("/auth/login", Object.fromEntries(formData.entries()));
      setToken(response.data.token);
      setMessage("Login successful. Token saved locally for future API calls.");
    } catch (_error) {
      setMessage("Login failed. Verify the backend is running and the credentials are valid.");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="glass-panel rounded-[2rem] p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-aurora/70">Secure access</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white">Login</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            required
            name="email"
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          />
          <input
            required
            name="password"
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          />
          <button className="w-full rounded-full bg-nebula-500 px-4 py-3 font-semibold text-white transition hover:bg-nebula-400">
            Login
          </button>
        </form>
        <p className="mt-5 text-sm text-white/65">{message}</p>
      </div>
    </div>
  );
}
