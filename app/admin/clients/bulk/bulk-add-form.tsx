"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MIN = 2;
const MAX = 8;

type ClientRow = { email: string; name: string; phone: string; timezone: string; dateOfBirth: string };

export function BulkAddForm() {
  const router = useRouter();
  const [rows, setRows] = useState<ClientRow[]>(
    Array(MIN)
      .fill(null)
      .map(() => ({ email: "", name: "", phone: "", timezone: "", dateOfBirth: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ created: Array<{ id: string; email: string; name: string | null }>; errors?: Array<{ index: number; email?: string; error: string }> } | null>(null);

  function addRow() {
    if (rows.length >= MAX) return;
    setRows((r) => [...r, { email: "", name: "", phone: "", timezone: "", dateOfBirth: "" }]);
  }
  function removeRow(i: number) {
    if (rows.length <= MIN) return;
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const clients = rows.map((r) => ({
      email: r.email.trim(),
      name: r.name.trim() || undefined,
      phone: r.phone.trim() || undefined,
      timezone: r.timezone.trim() || undefined,
      dateOfBirth: r.dateOfBirth || undefined,
    }));
    const valid = clients.filter((c) => c.email);
    if (valid.length < MIN) {
      setError(`At least ${MIN} clients with email are required.`);
      return;
    }
    if (valid.length > MAX) {
      setError(`At most ${MAX} clients allowed.`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: valid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create clients.");
        return;
      }
      setResult(data);
      if (data.created?.length && data.created.length === valid.length && !data.errors?.length) {
        router.push("/admin/clients");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}
      {result && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            Created {result.created?.length ?? 0} client(s).
          </p>
          {result.errors?.length ? (
            <ul className="mt-2 list-disc pl-4 text-sm text-amber-800 dark:text-amber-200">
              {result.errors.map((err, i) => (
                <li key={i}>
                  Row {err.index + 1}{err.email ? ` (${err.email})` : ""}: {err.error}
                </li>
              ))}
            </ul>
          ) : null}
          <Link href="/admin/clients" className="mt-2 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Back to clients
          </Link>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-zinc-200 dark:border-zinc-800">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/50">
              <th className="border-b px-2 py-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">Email *</th>
              <th className="border-b px-2 py-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</th>
              <th className="border-b px-2 py-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">Phone</th>
              <th className="border-b px-2 py-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">Timezone</th>
              <th className="border-b px-2 py-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">DOB</th>
              <th className="w-10 border-b px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-2 py-1">
                  <input
                    type="email"
                    required
                    value={row.email}
                    onChange={(e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))}
                    className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="email@example.com"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                    className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="tel"
                    value={row.phone}
                    onChange={(e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))}
                    className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    value={row.timezone}
                    onChange={(e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, timezone: e.target.value } : x)))}
                    className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="America/Los_Angeles"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="date"
                    value={row.dateOfBirth}
                    onChange={(e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, dateOfBirth: e.target.value } : x)))}
                    className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    disabled={rows.length <= MIN}
                    className="text-zinc-500 hover:text-red-600 disabled:opacity-40"
                    aria-label="Remove row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length < MAX && (
        <button
          type="button"
          onClick={addRow}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          + Add row (up to {MAX})
        </button>
      )}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)]"
        >
          {loading ? "Creating…" : "Create clients"}
        </button>
        <Link
          href="/admin/clients"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
