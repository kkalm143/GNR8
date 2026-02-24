"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddMetricForm({ className }: { className?: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [value, setValue] = useState("");
  const [loggedAt, setLoggedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const description = content.trim();
    if (!description) return;
    const body = description + (value.trim() ? ` ${value.trim()}` : "");
    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: body,
          type: "body_metric",
          value: value.trim() ? parseFloat(value) : undefined,
          loggedAt: loggedAt || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save.");
        setLoading(false);
        return;
      }
      setContent("");
      setValue("");
      setLoggedAt("");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      {error && (
        <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Metric (e.g. weight, waist)
          </label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. weight 150 lb"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Value (optional)
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 150"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Date (optional)
            </label>
            <input
              type="date"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
        >
          {loading ? "Saving…" : "Add metric"}
        </button>
      </div>
    </form>
  );
}
