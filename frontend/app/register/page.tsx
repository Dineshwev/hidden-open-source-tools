"use client";

import { FormEvent, useState } from "react";
import api from "@/lib/api";

export default function RegisterPage() {
  const [message, setMessage] = useState("Create an account to upload files and unlock downloads.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api.post("/auth/register", Object.fromEntries(formData.entries()));
      setMessage("Registration complete. You can now log in.");
      event.currentTarget.reset();
    } catch (_error) {
      setMessage("Registration failed. Check your backend configuration.");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="glass-panel rounded-[2rem] p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-aurora/70">Join the universe</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white">Register</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            required
            name="username"
            placeholder="Username"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          />
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
          <button className="w-full rounded-full bg-gradient-to-r from-nebula-500 to-ember px-4 py-3 font-semibold text-white">
            Create Account
          </button>
        </form>
        <p className="mt-5 text-sm text-white/65">{message}</p>
      </div>
    </div>
  );
}
