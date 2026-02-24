"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkAsReadButton({
  messageId,
  className,
}: {
  messageId: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/inbox/${messageId}/read`, {
        method: "PATCH",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 ${className ?? ""}`}
    >
      {loading ? "Marking…" : "Mark as read"}
    </button>
  );
}
