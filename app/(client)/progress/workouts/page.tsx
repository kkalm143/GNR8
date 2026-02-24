import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function WorkoutHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const entries = await prisma.progressEntry.findMany({
    where: { userId, type: "workout_completed" },
    orderBy: { createdAt: "desc" },
    include: {
      programAssignment: {
        include: { program: { select: { id: true, name: true } } },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Workout history
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Past completed workouts. Once structured workouts and logging are
        available, you&apos;ll see sets, reps, and details here.
      </p>
      <Link
        href="/progress"
        className="mt-4 inline-block text-sm font-medium text-[var(--brand)] hover:underline"
      >
        ← Back to Progress
      </Link>
      {entries.length === 0 ? (
        <p className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          No completed workouts logged yet. Log a workout from{" "}
          <Link href="/progress" className="font-medium text-[var(--brand)] hover:underline">
            Progress
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                Workout completed
                {e.programAssignment?.program && (
                  <> · {e.programAssignment.program.name}</>
                )}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                {e.content}
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                {(e.loggedAt ? new Date(e.loggedAt) : new Date(e.createdAt)).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
