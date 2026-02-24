"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export function UsersListFilters({
  currentSearch,
  currentRole,
}: {
  currentSearch: string;
  currentRole: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParams = useCallback(
    (updates: { search?: string; role?: string }) => {
      const next = new URLSearchParams(searchParams);
      if (updates.search !== undefined) {
        if (updates.search) next.set("search", updates.search);
        else next.delete("search");
      }
      if (updates.role !== undefined) {
        if (updates.role) next.set("role", updates.role);
        else next.delete("role");
      }
      startTransition(() => {
        router.push(`/admin/users?${next.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="users-search">
        Search users by name or email
      </label>
      <input
        id="users-search"
        type="search"
        placeholder="Search by name or email"
        defaultValue={currentSearch}
        onChange={(e) => setParams({ search: e.target.value || undefined })}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400"
      />
      <select
        aria-label="Filter by role"
        value={currentRole}
        onChange={(e) => setParams({ role: e.target.value || undefined })}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="client">Client</option>
      </select>
      {isPending && (
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Updating…</span>
      )}
    </div>
  );
}
