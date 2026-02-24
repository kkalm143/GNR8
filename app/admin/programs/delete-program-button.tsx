"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProgramButton({
  programId,
  programName,
}: {
  programId: string;
  programName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/programs/${programId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      alert("Something went wrong.");
    }
    setLoading(false);
    setConfirm(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`text-sm font-medium ${
        confirm
          ? "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      }`}
    >
      {loading ? "Deleting…" : confirm ? `Delete "${programName}"? (click again)` : "Delete"}
    </button>
  );
}
