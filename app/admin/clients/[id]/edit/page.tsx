import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { EditClientForm } from "./edit-client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.user.findFirst({
    where: { id, role: Role.client },
    include: { clientProfile: true },
  });
  if (!client) notFound();
  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/clients/${id}`}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← {client.name ?? client.email}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Edit client
      </h1>
      <EditClientForm
        clientId={id}
        initial={{
          name: client.name ?? "",
          email: client.email,
          phone: client.clientProfile?.phone ?? "",
          timezone: client.clientProfile?.timezone ?? "",
          dateOfBirth: client.clientProfile?.dateOfBirth
            ? client.clientProfile.dateOfBirth.toISOString().slice(0, 10)
            : "",
        }}
        className="mt-6 max-w-md"
      />
    </div>
  );
}
