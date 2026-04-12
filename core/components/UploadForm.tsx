"use client";

import { FormEvent, useState } from "react";
import api from "@/lib/api";

export default function UploadForm() {
  const [message, setMessage] = useState("Upload a file for manual review.");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("Uploading file...");

    const formData = new FormData(event.currentTarget);

    try {
      await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage("Upload submitted successfully. It is now pending admin review.");
      event.currentTarget.reset();
    } catch (_error) {
      setMessage("Upload failed. Check your API settings and authentication token.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-white/75">Title</span>
          <input
            required
            name="title"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
            placeholder="Neon UI Asset Pack"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/75">Category ID</span>
          <input
            required
            name="categoryId"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
            placeholder="Paste a category UUID from the API"
          />
        </label>
      </div>

      <label className="mt-5 block space-y-2">
        <span className="text-sm text-white/75">Description</span>
        <textarea
          required
          name="description"
          rows={4}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
          placeholder="Describe what makes this file valuable for the community."
        />
      </label>

      <label className="mt-5 block space-y-2">
        <span className="text-sm text-white/75">Tags</span>
        <input
          required
          name="tags"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
          placeholder="ui kit, template, dashboard"
        />
      </label>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-white/75">License</span>
          <input
            required
            name="license"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
            placeholder="CC BY 4.0"
          />
        </label>
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
      </div>

      <label className="mt-5 block space-y-2">
        <span className="text-sm text-white/75">Preview image URL</span>
        <input
          name="previewImageUrl"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-nebula-400"
          placeholder="https://example.com/preview.png"
        />
      </label>

      <label className="mt-5 block space-y-2">
        <span className="text-sm text-white/75">Upload file</span>
        <input
          required
          type="file"
          name="file"
          className="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-4 text-sm"
        />
      </label>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-white/65">{message}</p>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-gradient-to-r from-nebula-500 to-ember px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit File"}
        </button>
      </div>
    </form>
  );
}


