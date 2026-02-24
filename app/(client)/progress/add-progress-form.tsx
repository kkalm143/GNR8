"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Assignment = {
  id: string;
  program: { id: string; name: string };
};

const PROGRESS_TYPES = [
  { value: "note", label: "Note" },
  { value: "workout_completed", label: "Workout completed" },
  { value: "body_metric", label: "Body metric (e.g. weight)" },
  { value: "measurement", label: "Measurement" },
  { value: "progress_photo", label: "Progress photo note" },
] as const;

export function AddProgressForm({
  assignments,
  className,
}: {
  assignments: Assignment[];
  className?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [programAssignmentId, setProgramAssignmentId] = useState("");
  const [type, setType] = useState<string>("note");
  const [value, setValue] = useState("");
  const [loggedAt, setLoggedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          programAssignmentId: programAssignmentId || undefined,
          type: type || "note",
          value: value !== "" ? parseFloat(value) : undefined,
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
      setProgramAssignmentId("");
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
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {PROGRESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Notes / value
          </label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How are you doing? Wins, notes, or description (e.g. weight 150 lb)."
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Numeric value (optional)
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
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Link to program (optional)
          </label>
          <select
            value={programAssignmentId}
            onChange={(e) => setProgramAssignmentId(e.target.value)}
            className="w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">None</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.program.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        >
          {loading ? "Saving…" : "Add progress note"}
        </button>
      </div>
    </form>
  );
}
