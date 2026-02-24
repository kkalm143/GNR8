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
    include: { program: true },
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
    </div>
  );
}
