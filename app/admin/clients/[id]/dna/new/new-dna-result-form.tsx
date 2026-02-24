"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DNAInterpretationField } from "@prisma/client";

type Field = DNAInterpretationField;

type Props = {
  clientId: string;
  fields: Field[];
  className?: string;
};

export function NewDNAResultForm({ clientId, fields, className }: Props) {
  const router = useRouter();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState("");
  const [rawFileUrl, setRawFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsePreview, setParsePreview] = useState<{
    summary: string;
    sampleId?: string;
    processingDate?: string;
    gender?: string;
    numSnps?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setParsePreview(null);
    setRawFileUrl("");
    setUploading(true);
    setError("");
    try {
      const formDataParse = new FormData();
      formDataParse.set("file", f);
      const parseRes = await fetch("/api/admin/parse-dna-file", {
        method: "POST",
        body: formDataParse,
      });
      const parseData = await parseRes.json().catch(() => ({}));
      if (parseRes.ok && parseData.summary) {
        setSummary((prev) => prev || parseData.summary);
        setParsePreview({
          summary: parseData.summary,
          sampleId: parseData.sampleId,
          processingDate: parseData.processingDate,
          gender: parseData.gender,
          numSnps: parseData.numSnps,
        });
      }

      const formDataUpload = new FormData();
      formDataUpload.set("file", f);
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        setError(uploadData.error ?? "Upload failed. Summary was filled from lab file.");
        setFile(null);
        setUploading(false);
        return;
      }
      setRawFileUrl(uploadData.url ?? "");
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
      const res = await fetch(`/api/admin/clients/${clientId}/dna`, {
        method: "POST",
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
            placeholder="Optional notes from lab results..."
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Lab file (optional)
          </label>
          <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
            Supports GSGT lab reports: [Header] and [Data] sections (tab-delimited). Summary is auto-filled from the file.
          </p>
          <input
            type="file"
            accept=".txt,.csv,.tsv"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          {uploading && <p className="mt-1 text-xs text-zinc-500">Parsing and uploading…</p>}
          {parsePreview && !uploading && (
            <div className="mt-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-900/50">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Lab file recognized</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{parsePreview.summary}</p>
            </div>
          )}
          {rawFileUrl && !uploading && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">File attached.</p>
          )}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        >
          {loading ? "Saving…" : "Save DNA result"}
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
