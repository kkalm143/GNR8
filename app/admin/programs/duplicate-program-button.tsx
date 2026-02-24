"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DuplicateProgramButton({
  programId,
  programName,
}: {
  programId: string;
  programName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/programs/${programId}/clone`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Failed to duplicate program.");
        setLoading(false);
        return;
      }
      if (data.id) {
        router.push(`/admin/programs/${data.id}`);
        router.refresh();
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
      onClick={handleDuplicate}
      disabled={loading}
      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      {loading ? "…" : "Duplicate"}
    </button>
  );
}
