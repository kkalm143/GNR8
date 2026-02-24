import Link from "next/link";
import { prisma } from "@/lib/db";
import { GroupsList } from "./groups-list";

export default async function AdminGroupsPage() {
  const groups = await prisma.clientGroup.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Client groups
        </h1>
        <Link
          href="/admin/groups/new"
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:text-white dark:hover:bg-[var(--brand-hover)]"
        >
          New group
        </Link>
      </div>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Create groups to segment clients. Filter the client list by group from the Clients page.
      </p>
      <GroupsList groups={groups} />
    </div>
  );
}
