"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteDNAResultButton({
  clientId,
  resultId,
  resultLabel,
}: {
  clientId: string;
  resultId: string;
  resultLabel: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete this DNA result (${resultLabel})? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/dna/${resultId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete.");
      } else {
        router.refresh();
      }
    } catch {
      alert("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 disabled:opacity-50"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
