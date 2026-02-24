import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { ClientListFilters } from "./client-list-filters";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; archived?: string; groupId?: string }>;
}) {
  const params = await searchParams;
  const search = (params.search ?? "").trim();
  const archived = params.archived === "true";
  const groupId = (params.groupId ?? "").trim() || undefined;

  const where: Parameters<typeof prisma.user.findMany>[0]["where"] = {
    role: Role.client,
    archivedAt: archived ? { not: null } : null,
  };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (groupId) {
    where.clientGroups = { some: { groupId } };
  }

  const [clients, groups] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { clientProfile: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientGroup.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { users: true } } },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Clients
        </h1>
        <div className="flex gap-2">
          <Link
            href="/admin/clients/bulk"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Bulk add
          </Link>
          <Link
            href="/admin/clients/import"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Import CSV
          </Link>
          <Link
            href="/admin/clients/new"
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:text-white dark:hover:bg-[var(--brand-hover)]"
          >
            Add client
          </Link>
        </div>
      </div>
      <ClientListFilters
        groups={groups}
        currentSearch={search}
        currentArchived={archived ? "true" : "false"}
        currentGroupId={params.groupId ?? ""}
      />
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  {archived ? "No archived clients." : "No clients yet. Add one to get started."}
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {c.name ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {c.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {c.clientProfile?.phone ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {c.archivedAt ? (
                      <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                        Archived
                      </span>
                    ) : (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      View
                    </Link>
                    <span className="mx-2 text-zinc-300 dark:text-zinc-600">|</span>
                    <Link
                      href={`/admin/clients/${c.id}/edit`}
                      className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
