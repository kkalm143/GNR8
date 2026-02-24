import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { ManageGroupMembers } from "./manage-group-members";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await prisma.clientGroup.findUnique({
    where: { id },
    include: {
      users: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!group) notFound();
  const clients = await prisma.user.findMany({
    where: { role: Role.client, archivedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/groups"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Groups
        </Link>
      </div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {group.name}
          </h1>
          {group.description && (
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              {group.description}
            </p>
          )}
        </div>
        <Link
          href={`/admin/groups/${id}/edit`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Edit group
        </Link>
      </div>
      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Members ({group.users.length})
        </h2>
        <ManageGroupMembers
          groupId={id}
          currentMembers={group.users.map((u) => u.user)}
          allClients={clients}
        />
      </section>
    </div>
  );
}
