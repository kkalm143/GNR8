import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { ClientSettingsForm } from "./client-settings-form";

export default async function ClientSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.user.findFirst({
    where: { id, role: Role.client },
    include: { clientProfile: { include: { clientSettings: true } } },
  });
  if (!client?.clientProfile) notFound();
  const settings = client.clientProfile.clientSettings ?? {
    workoutComments: true,
    workoutVisibility: true,
    allowRearrange: false,
    replaceExercise: false,
    allowCreateWorkouts: false,
    pinnedMetrics: null,
  };
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
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Client settings
      </h1>
      <ClientSettingsForm
        clientId={id}
        initialSettings={{
          workoutComments: settings.workoutComments,
          workoutVisibility: settings.workoutVisibility,
          allowRearrange: settings.allowRearrange,
          replaceExercise: settings.replaceExercise,
          allowCreateWorkouts: settings.allowCreateWorkouts,
          pinnedMetrics: Array.isArray(settings.pinnedMetrics) ? (settings.pinnedMetrics as string[]) : [],
        }}
      />
    </div>
  );
}
