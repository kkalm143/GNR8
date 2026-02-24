"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  completedAt: Date | null;
  assignedBy: { id: string; name: string | null };
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [completingId, setCompletingId] = useState<string | null>(null);

  async function handleComplete(id: string) {
    setCompletingId(id);
    try {
      const res = await fetch(`/api/tasks/${id}/complete`, { method: "PATCH" });
      if (res.ok) router.refresh();
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <ul className="mt-3 space-y-2">
      {tasks.map((t) => (
        <li
          key={t.id}
          className={`rounded-lg border px-4 py-3 ${
            t.completedAt
              ? "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className={`font-medium ${t.completedAt ? "text-zinc-500 line-through dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-50"}`}>
                {t.title}
              </p>
              {t.description && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {t.description}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                From {t.assignedBy.name ?? "Coach"}
                {t.dueDate && ` · Due ${new Date(t.dueDate).toLocaleDateString()}`}
              </p>
            </div>
            {!t.completedAt && (
              <button
                type="button"
                onClick={() => handleComplete(t.id)}
                disabled={completingId === t.id}
                className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {completingId === t.id ? "Marking…" : "Mark complete"}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
