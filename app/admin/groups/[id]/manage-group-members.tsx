"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type User = { id: string; name: string | null; email: string };

export function ManageGroupMembers({
  groupId,
  currentMembers,
  allClients,
}: {
  groupId: string;
  currentMembers: User[];
  allClients: User[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const memberIds = new Set(currentMembers.map((u) => u.id));
  const available = allClients.filter((c) => !memberIds.has(c.id));

  async function addMember(userId: string) {
    setAdding(userId);
    try {
      const res = await fetch(`/api/admin/client-groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [userId] }),
      });
      if (res.ok) router.refresh();
    } finally {
      setAdding(null);
    }
  }

  async function removeMember(userId: string) {
    setRemoving(userId);
    try {
      const res = await fetch(`/api/admin/client-groups/${groupId}/members?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-4">
      {currentMembers.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          No members. Add clients below.
        </p>
      ) : (
        <ul className="space-y-2">
          {currentMembers.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {u.name ?? u.email}
              </span>
              <span className="text-sm text-zinc-500">{u.email}</span>
              <button
                type="button"
                onClick={() => removeMember(u.id)}
                disabled={!!removing}
                className="text-sm text-red-600 hover:underline disabled:opacity-50"
              >
                {removing === u.id ? "Removing…" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {available.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Add client
          </h3>
          <ul className="space-y-1">
            {available.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {c.name ?? c.email}
                </span>
                <span className="text-xs text-zinc-500">{c.email}</span>
                <button
                  type="button"
                  onClick={() => addMember(c.id)}
                  disabled={!!adding}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 disabled:opacity-50"
                >
                  {adding === c.id ? "Adding…" : "Add"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
