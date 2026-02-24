"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Client = { id: string; name: string | null; email: string };

export function AssignProgramToManyForm({ programId }: { programId: string }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) {
      setError("Select at least one client.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body: { userIds: string[]; startDate?: string; endDate?: string } = {
        userIds: Array.from(selected),
      };
      if (startDate) body.startDate = startDate;
      if (endDate) body.endDate = endDate;
      const res = await fetch(`/api/admin/programs/${programId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to assign.");
        return;
      }
      if (data.assigned?.length) {
        setSelected(new Set());
        router.refresh();
      }
      if (data.errors?.length) {
        setError(data.errors.map((e: { error: string }) => e.error).join("; "));
      }
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!loaded) return <p className="text-sm text-zinc-500">Loading clients…</p>;

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      {error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Select clients to assign this program to (only active clients shown).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Start date (optional)</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">End date (optional)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto rounded border border-zinc-200 p-2 dark:border-zinc-800">
        {clients.length === 0 ? (
          <p className="py-2 text-sm text-zinc-500">No active clients.</p>
        ) : (
          <ul className="space-y-1">
            {clients.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    className="rounded border-zinc-300 dark:border-zinc-600"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">
                    {c.name ?? c.email}
                  </span>
                  <span className="text-xs text-zinc-500">{c.email}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || selected.size === 0}
        className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)]"
      >
        {loading ? "Assigning…" : `Assign to ${selected.size} client(s)`}
      </button>
    </form>
  );
}
