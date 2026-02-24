import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { NewDNAResultForm } from "./new-dna-result-form";

export default async function NewDNAResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = await params;
  const [client, fields] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, role: Role.client },
      select: { id: true, name: true, email: true },
    }),
    prisma.dNAInterpretationField.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  if (!client) notFound();
  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/clients/${userId}`}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← {client.name ?? client.email}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Add DNA result
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Assign values for each interpretation field and optional summary. You can attach a lab file if upload is configured.
      </p>
      <NewDNAResultForm clientId={userId} fields={fields} className="mt-6 max-w-lg" />
    </div>
  );
}
