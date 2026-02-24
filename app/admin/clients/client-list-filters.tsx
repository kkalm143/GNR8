"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { featureFlags } from "@/lib/feature-flags";

type ClientGroup = { id: string; name: string; _count?: { users: number } };

export function ClientListFilters({
  groups,
  currentSearch,
  currentArchived,
  currentGroupId,
}: {
  groups: ClientGroup[];
  currentSearch: string;
  currentArchived: "false" | "true";
  currentGroupId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParams = useCallback(
    (updates: { search?: string; archived?: string; groupId?: string }) => {
      const next = new URLSearchParams(searchParams);
      if (updates.search !== undefined) {
        if (updates.search) next.set("search", updates.search);
        else next.delete("search");
      }
      if (updates.archived !== undefined) {
        next.set("archived", updates.archived);
      }
      if (updates.groupId !== undefined) {
        if (updates.groupId) next.set("groupId", updates.groupId);
        else next.delete("groupId");
      }
      startTransition(() => {
        router.push(`/admin/clients?${next.toString()}`);
      });
    },
    [router, searchParams]
  );

  const baseQuery = new URLSearchParams();
  if (currentSearch) baseQuery.set("search", currentSearch);
  if (currentGroupId) baseQuery.set("groupId", currentGroupId);
  const activeHref = `/admin/clients?${baseQuery.toString()}`;
  baseQuery.set("archived", "true");
  const archivedHref = `/admin/clients?${baseQuery.toString()}`;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="client-search">
        Search clients by name or email
      </label>
      <input
        id="client-search"
        type="search"
        placeholder="Search by name or email…"
        defaultValue={currentSearch}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setParams({ search: (e.target as HTMLInputElement).value.trim() });
          }
        }}
      />
      <button
        type="button"
        onClick={() => setParams({ search: (document.getElementById("client-search") as HTMLInputElement)?.value?.trim() ?? "" })}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Search
      </button>
      <span className="text-zinc-400 dark:text-zinc-500">|</span>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">Status:</span>
      <Link
        href={currentArchived === "false" ? "#" : activeHref}
        className={`rounded px-2 py-1 text-sm font-medium ${currentArchived === "false" ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
      >
        Active
      </Link>
      <Link
        href={currentArchived === "true" ? "#" : archivedHref}
        className={`rounded px-2 py-1 text-sm font-medium ${currentArchived === "true" ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
      >
        Archived
      </Link>
      {featureFlags.groups && groups.length > 0 && (
        <>
          <span className="text-zinc-400 dark:text-zinc-500">|</span>
          <label className="text-sm text-zinc-600 dark:text-zinc-400" htmlFor="client-group">
            Group:
          </label>
          <select
            id="client-group"
            value={currentGroupId}
            onChange={(e) => setParams({ groupId: e.target.value })}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </>
      )}
      {isPending && <span className="text-xs text-zinc-500">Updating…</span>}
    </div>
  );
}
