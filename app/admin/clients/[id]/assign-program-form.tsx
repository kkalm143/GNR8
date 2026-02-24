"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Program = { id: string; name: string };

export function AssignProgramForm({
  clientId,
  programs,
}: {
  clientId: string;
  programs: Program[];
}) {
  const router = useRouter();
  const [programId, setProgramId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!programId) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to assign program.");
        setLoading(false);
        return;
      }
      setProgramId("");
      setStartDate("");
      setEndDate("");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  if (programs.length === 0) {
    return (
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        No active programs. <Link href="/admin/programs/new" className="underline">Create one</Link> first.
      </span>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <select
        value={programId}
        onChange={(e) => setProgramId(e.target.value)}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        <option value="">Select program…</option>
        {programs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">
          Start
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">
          End
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <button
        type="submit"
        disabled={!programId || loading}
        className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
      >
        {loading ? "Assigning…" : "Assign"}
      </button>
      {error && (
        <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
      )}
    </form>
  );
}
