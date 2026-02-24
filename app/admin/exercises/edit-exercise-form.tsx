"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function EditExerciseForm({
  exerciseId,
  initial,
}: {
  exerciseId: string;
  initial: { name: string; description: string; demoVideoUrl: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [demoVideoUrl, setDemoVideoUrl] = useState(initial.demoVideoUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/exercises/${exerciseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          demoVideoUrl: demoVideoUrl.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update.");
        setLoading(false);
        return;
      }
      router.push("/admin/exercises");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      {error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Demo video URL</label>
        <input
          type="url"
          value={demoVideoUrl}
          onChange={(e) => setDemoVideoUrl(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <Link
          href="/admin/exercises"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
