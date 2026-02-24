import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditGroupForm } from "../edit-group-form";

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await prisma.clientGroup.findUnique({ where: { id } });
  if (!group) notFound();
  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/groups/${id}`}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← {group.name}
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Edit group
      </h1>
      <EditGroupForm groupId={id} initialName={group.name} initialDescription={group.description ?? ""} />
    </div>
  );
}
