import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AssignProgramToManyForm } from "./assign-many-form";
import { DeleteProgramButton } from "../delete-program-button";
import { WorkoutBuilder } from "./workout-builder";

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
      <div className="mb-6">
        <Link
          href="/admin/programs"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Programs
        </Link>
      </div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {program.name}
          </h1>
          {!program.isActive && (
            <span className="mt-1 inline-block rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
              Inactive
            </span>
          )}
          {program.description && (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {program.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/programs/${id}/edit`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Edit
          </Link>
          <DeleteProgramButton programId={program.id} programName={program.name} />
        </div>
      </div>

      {program.content && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Content / instructions
          </h2>
          <div className="mt-2 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
            {program.content}
          </div>
        </section>
      )}

      {program.workoutSections.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Workout structure
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Build sections and sets from the program builder (API ready: POST /api/admin/programs/[id]/sections, sections/[sectionId]/sets).
          </p>
          <ul className="mt-4 space-y-4">
            {program.workoutSections.map((sec) => (
              <li key={sec.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                  {sec.name || `${sec.type} section`}
                  {sec.durationSeconds != null && ` (${sec.durationSeconds}s)`}
                </h3>
                {sec.sets.length > 0 ? (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {sec.sets.map((s) => (
                      <li key={s.id}>
                        {s.exercise?.name ?? s.customLabel ?? "Set"} — {[s.reps, s.repRange, s.weight].filter(Boolean).join(" ") || "—"}
                        {s.setType !== "normal" && ` (${s.setType})`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500">No sets yet.</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

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
