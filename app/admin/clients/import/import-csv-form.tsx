"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ImportCsvForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    created: Array<{ id: string; email: string; name: string | null }>;
    errors: Array<{ row: number; email?: string; error: string }>;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);
    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }
    setLoading(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/admin/clients/import-csv", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Import failed.");
        return;
      }
      setResult(data);
      if (data.created?.length) {
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
            <ul className="mt-2 max-h-48 list-disc overflow-y-auto pl-4 text-sm text-amber-800 dark:text-amber-200">
              {result.errors.map((err, i) => (
                <li key={i}>
                  Row {err.row}{err.email ? ` (${err.email})` : ""}: {err.error}
                </li>
              ))}
            </ul>
          ) : null}
          <Link href="/admin/clients" className="mt-2 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Back to clients
          </Link>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          CSV file
        </label>
        <input
          type="file"
          accept=".csv"
          className="mt-1 block w-full rounded border border-zinc-300 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)]"
        >
          {loading ? "Importing…" : "Import"}
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
