"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  fieldId: string;
  initial: {
    name: string;
    type: "scale" | "category";
    min: number;
    max: number;
    options: string;
    displayOrder: number;
  };
  className?: string;
};

export function EditDNAFieldForm({ fieldId, initial, className }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [type, setType] = useState<"scale" | "category">(initial.type);
  const [min, setMin] = useState(initial.min);
  const [max, setMax] = useState(initial.max);
  const [optionsText, setOptionsText] = useState(initial.options);
  const [displayOrder, setDisplayOrder] = useState(initial.displayOrder);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const options = type === "category" && optionsText.trim()
        ? optionsText.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;
      const res = await fetch(`/api/admin/dna-fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          min: type === "scale" ? min : undefined,
          max: type === "scale" ? max : undefined,
          options: type === "category" ? options ?? [] : undefined,
          displayOrder,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update field.");
        setLoading(false);
        return;
      }
      router.push("/admin/dna/fields");
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
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "scale" | "category")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="scale">Scale (e.g. 1–10)</option>
            <option value="category">Category (options)</option>
          </select>
        </div>
        {type === "scale" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Min
              </label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Max
              </label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
        )}
        {type === "category" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Options (comma-separated)
            </label>
            <input
              type="text"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Display order
          </label>
          <input
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
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
          href="/admin/dna/fields"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
