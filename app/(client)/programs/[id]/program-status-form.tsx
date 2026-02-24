"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AssignmentStatus } from "@prisma/client";

export function ProgramStatusForm({
  assignmentId,
  currentStatus,
  className,
}: {
  assignmentId: string;
  currentStatus: AssignmentStatus;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function setStatus(status: AssignmentStatus) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/me/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update status.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Update status:
        </span>
        {currentStatus !== "in_progress" && (
          <button
            type="button"
            onClick={() => setStatus("in_progress")}
            disabled={loading}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Mark in progress
          </button>
        )}
        {currentStatus !== "completed" && (
          <button
            type="button"
            onClick={() => setStatus("completed")}
            disabled={loading}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Mark completed
          </button>
        )}
        {currentStatus !== "assigned" && (
          <button
            type="button"
            onClick={() => setStatus("assigned")}
            disabled={loading}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset to assigned
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
