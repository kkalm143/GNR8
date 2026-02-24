"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Settings = {
  workoutComments: boolean;
  workoutVisibility: boolean;
  allowRearrange: boolean;
  replaceExercise: boolean;
  allowCreateWorkouts: boolean;
  pinnedMetrics: string[];
};

export function ClientSettingsForm({
  clientId,
  initialSettings,
}: {
  clientId: string;
  initialSettings: Settings;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.workoutComments}
          onChange={(e) => setSettings((s) => ({ ...s, workoutComments: e.target.checked }))}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Workout comments (allow coach/client comments on completed workouts)
        </span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.workoutVisibility}
          onChange={(e) => setSettings((s) => ({ ...s, workoutVisibility: e.target.checked }))}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Workout visibility (client can see assigned workouts)
        </span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.allowRearrange}
          onChange={(e) => setSettings((s) => ({ ...s, allowRearrange: e.target.checked }))}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Allow client to reorder workouts
        </span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.replaceExercise}
          onChange={(e) => setSettings((s) => ({ ...s, replaceExercise: e.target.checked }))}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Allow client to substitute/replace exercises
        </span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.allowCreateWorkouts}
          onChange={(e) => setSettings((s) => ({ ...s, allowCreateWorkouts: e.target.checked }))}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Allow client to create own workouts
        </span>
      </label>
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)]"
        >
          {loading ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
