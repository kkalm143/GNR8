import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddProgressForm } from "./add-progress-form";

export default async function ProgressPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      progressEntries: {
        include: {
          programAssignment: {
            include: { program: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      programAssignments: {
        include: { program: { select: { id: true, name: true } } },
        orderBy: { assignedAt: "desc" },
      },
    },
  });
  const entries = user?.progressEntries ?? [];
  const assignments = user?.programAssignments ?? [];
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <span className="border-b-2 border-[var(--section-cool)] pb-0.5">My progress</span>
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Log notes and track how you&apos;re doing. Optionally link an entry to a program.
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        <Link
          href="/progress/workouts"
          className="text-sm font-medium text-[var(--brand)] hover:underline"
        >
          View workout history →
        </Link>
        <Link
          href="/progress/metrics"
          className="text-sm font-medium text-[var(--brand)] hover:underline"
        >
          Body metrics →
        </Link>
      </div>
      <AddProgressForm assignments={assignments} className="mt-6" />
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Recent entries
        </h2>
        {entries.length === 0 ? (
          <p
            className="mt-4 rounded-xl border-l-4 border-[var(--section-cool)] bg-[var(--surface-card)] py-8 text-center text-sm text-zinc-600 dark:text-zinc-400"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            No progress entries yet. Add one above.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {entries.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border-l-4 border-[var(--section-cool)] bg-[var(--surface-card)] px-4 py-3 shadow-sm dark:bg-[var(--surface-card)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {e.type.replace("_", " ")}
                  {e.value != null && ` · ${e.value}`}
                </p>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {e.content}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{(e.loggedAt ? new Date(e.loggedAt) : new Date(e.createdAt)).toLocaleString()}</span>
                  {e.programAssignment?.program && (
                    <>
                      <span>·</span>
                      <span>Program: {e.programAssignment.program.name}</span>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
