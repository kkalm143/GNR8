import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AssignProgramToManyForm } from "./assign-many-form";
import { DeleteProgramButton } from "../delete-program-button";
import { WorkoutBuilder } from "./workout-builder";
import { EditProgramForm } from "./edit/edit-program-form";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      assignments: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { assignedAt: "desc" },
      },
      workoutSections: {
        orderBy: { displayOrder: "asc" },
        include: {
          sets: {
            orderBy: { displayOrder: "asc" },
            include: { exercise: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
  if (!program) notFound();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/programs"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Programs
        </Link>
        <div className="flex items-center gap-2">
          <DeleteProgramButton programId={program.id} programName={program.name} />
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Program details</h2>
        <EditProgramForm
          programId={id}
          initial={{
            name: program.name,
            description: program.description ?? "",
            content: program.content ?? "",
            isActive: program.isActive,
            displayOrder: program.displayOrder,
            tags: Array.isArray(program.tags) ? (program.tags as string[]) : [],
          }}
          className="max-w-2xl"
        />
      </section>

      <section className="mb-8">
        <WorkoutBuilder programId={id} initialSections={program.workoutSections} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Assigned clients ({program.assignments.length})
        </h2>
        <div className="mt-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Assign to multiple clients
          </h3>
          <AssignProgramToManyForm programId={id} />
        </div>
        {program.assignments.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No clients assigned yet. Assign above or from a client&apos;s profile.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {program.assignments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <Link
                  href={`/admin/clients/${a.user.id}`}
                  className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                >
                  {a.user.name ?? a.user.email}
                </Link>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {a.status.replace("_", " ")} · Assigned {new Date(a.assignedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
