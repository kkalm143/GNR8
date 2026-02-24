"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConsultationFileSection({
  clientId,
  consultationFileUrl,
}: {
  clientId: string;
  consultationFileUrl: string | null;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch(`/api/admin/clients/${clientId}/consultation`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      router.refresh();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Consultation file
      </h2>
      {error && (
        <p className="mb-2 rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}
      {consultationFileUrl ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <a
            href={consultationFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            View / download consultation file
          </a>
          <span className="text-zinc-400">|</span>
          <label className="cursor-pointer text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            {uploading ? "Uploading…" : "Replace file"}
            <input
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,image/*"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            No consultation file attached.
          </p>
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
            {uploading ? "Uploading…" : "Attach consultation file"}
            <input
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,image/*"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>
      )}
    </section>
  );
}
