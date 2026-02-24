import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgramStatusForm } from "./program-status-form";

export default async function ClientProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const { id } = await params;
  const assignment = await prisma.programAssignment.findFirst({
    where: { userId, programId: id },
    include: {
      program: {
        include: {
          workoutSections: {
            orderBy: { displayOrder: "asc" },
            include: {
              sets: {
                orderBy: { displayOrder: "asc" },
                include: { exercise: { select: { id: true, name: true, demoVideoUrl: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!assignment) notFound();
  const { program } = assignment;
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/programs"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← My programs
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {program.name}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Status: {assignment.status.replace("_", " ")} · Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
        {assignment.startDate && ` · Start ${new Date(assignment.startDate).toLocaleDateString()}`}
        {assignment.endDate && ` · End ${new Date(assignment.endDate).toLocaleDateString()}`}
      </p>
      <ProgramStatusForm
        assignmentId={assignment.id}
        currentStatus={assignment.status}
        className="mt-3"
      />
      {program.description && (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {program.description}
        </p>
      )}
      {program.content && (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Instructions
          </h2>
          <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {program.content}
          </div>
        </div>
      )}
      {program.workoutSections && program.workoutSections.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Workout</h2>
          <div className="mt-4 space-y-6">
            {program.workoutSections.map((sec) => (
              <div key={sec.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                  {sec.name || `${sec.type} section`}
                  {sec.durationSeconds != null && ` (${sec.durationSeconds}s)`}
                </h3>
                <ul className="mt-3 space-y-2">
                  {sec.sets.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-baseline gap-2 text-sm">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {s.exercise?.name ?? s.customLabel ?? "Set"}
                      </span>
                      {[s.reps, s.repRange, s.weight].filter(Boolean).length > 0 && (
                        <span className="text-zinc-600 dark:text-zinc-400">
                          — {[s.reps, s.repRange, s.weight].filter(Boolean).join(" ")}
                        </span>
                      )}
                      {s.setType !== "normal" && (
                        <span className="text-zinc-500 dark:text-zinc-400">({s.setType})</span>
                      )}
                      {s.exercise?.demoVideoUrl && (
                        <a
                          href={s.exercise.demoVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--brand)] hover:underline"
                        >
                          Watch demo
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
