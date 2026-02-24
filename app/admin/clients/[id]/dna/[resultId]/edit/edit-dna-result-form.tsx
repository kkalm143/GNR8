"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DNAInterpretationField } from "@prisma/client";

type Field = DNAInterpretationField;

type Props = {
  clientId: string;
  resultId: string;
  fields: Field[];
  initial: {
    fieldValues: Record<string, string>;
    summary: string;
    rawFileUrl: string;
  };
  className?: string;
};

export function EditDNAResultForm({ clientId, resultId, fields, initial, className }: Props) {
  const router = useRouter();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(initial.fieldValues);
  const [summary, setSummary] = useState(initial.summary);
  const [rawFileUrl, setRawFileUrl] = useState(initial.rawFileUrl);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", f);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        setFile(null);
        setUploading(false);
        return;
      }
      setRawFileUrl(data.url ?? "");
    } catch {
      setError("Upload failed.");
      setFile(null);
    }
    setUploading(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const values: Record<string, string | number> = {};
      for (const [fieldId, v] of Object.entries(fieldValues)) {
        if (v === "") continue;
        const f = fields.find((x) => x.id === fieldId);
        if (f?.type === "scale" && f.min != null && f.max != null) {
          const n = Number(v);
          if (!Number.isNaN(n)) values[fieldId] = n;
        } else values[fieldId] = v;
      }
      const res = await fetch(`/api/admin/clients/${clientId}/dna/${resultId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldValues: Object.keys(values).length ? values : null,
          summary: summary || null,
          rawFileUrl: rawFileUrl || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save DNA result.");
        setLoading(false);
        return;
      }
      router.push(`/admin/clients/${clientId}`);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      {error && (
        <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.id}>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {f.name}
              {f.type === "scale" && f.min != null && f.max != null && (
                <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-400">
                  ({f.min}–{f.max})
                </span>
              )}
            </label>
            {f.type === "scale" ? (
              <input
                type="number"
                min={f.min ?? 0}
                max={f.max ?? 10}
                value={fieldValues[f.id] ?? ""}
                onChange={(e) => setFieldValues((prev) => ({ ...prev, [f.id]: e.target.value }))}
                className="w-full max-w-[8rem] rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            ) : (
              <select
                value={fieldValues[f.id] ?? ""}
                onChange={(e) => setFieldValues((prev) => ({ ...prev, [f.id]: e.target.value }))}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">—</option>
                {Array.isArray(f.options) &&
                  (f.options as string[]).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
              </select>
            )}
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Summary / notes
          </label>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Lab file (optional)
          </label>
          {rawFileUrl && (
            <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
              Current: <a href={rawFileUrl} target="_blank" rel="noopener noreferrer" className="underline">View file</a>
            </p>
          )}
          <input
            type="file"
            accept=".txt,.csv,.tsv,.json"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          {uploading && <p className="mt-1 text-xs text-zinc-500">Uploading…</p>}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <Link
          href={`/admin/clients/${clientId}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
