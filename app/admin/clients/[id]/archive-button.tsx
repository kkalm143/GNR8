"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ArchiveButton({
  clientId,
  isArchived,
  className,
}: {
  clientId: string;
  isArchived: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !isArchived }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? "…" : isArchived ? "Reactivate" : "Archive"}
    </button>
  );
}
