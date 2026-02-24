"use client";

import Link from "next/link";

type Program = { id: string; tags: unknown };

export function ProgramTagFilter({
  programs,
  currentTag,
}: {
  programs: Program[];
  currentTag: string | null;
}) {
  const tags = new Set<string>();
  for (const p of programs) {
    if (Array.isArray(p.tags)) {
      for (const t of p.tags as string[]) {
        if (typeof t === "string" && t.trim()) tags.add(t.trim());
      }
    }
  }
  const tagList = Array.from(tags).sort();
  if (tagList.length === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Filter by tag:</span>
      <Link
        href="/admin/programs"
        className={`rounded-full px-3 py-1 text-sm ${!currentTag ? "bg-[var(--brand)] text-white" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"}`}
      >
        All
      </Link>
      {tagList.map((t) => (
        <Link
          key={t}
          href={currentTag === t ? "/admin/programs" : `/admin/programs?tag=${encodeURIComponent(t)}`}
          className={`rounded-full px-3 py-1 text-sm ${currentTag === t ? "bg-[var(--brand)] text-white" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"}`}
        >
          {t}
        </Link>
      ))}
    </div>
  );
}
