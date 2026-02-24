import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { EditDNAResultForm } from "./edit-dna-result-form";

export default async function EditDNAResultPage({
  params,
}: {
  params: Promise<{ id: string; resultId: string }>;
}) {
  const { id: userId, resultId } = await params;
  const [client, result, fields] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, role: Role.client },
      select: { id: true, name: true, email: true },
    }),
    prisma.dNAResult.findFirst({
      where: { id: resultId, userId },
    }),
    prisma.dNAInterpretationField.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  if (!client || !result) notFound();
  const fieldValues = (result.fieldValues as Record<string, string | number> | null) ?? {};
  const fieldValuesStr: Record<string, string> = {};
  for (const [k, v] of Object.entries(fieldValues)) {
    fieldValuesStr[k] = String(v);
  }
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
        Edit DNA result
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {new Date(result.createdAt).toLocaleDateString()}
      </p>
      <EditDNAResultForm
        clientId={userId}
        resultId={resultId}
        fields={fields}
        initial={{ fieldValues: fieldValuesStr, summary: result.summary ?? "", rawFileUrl: result.rawFileUrl ?? "" }}
        className="mt-6 max-w-lg"
      />
    </div>
  );
}
