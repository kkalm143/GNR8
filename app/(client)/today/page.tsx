import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TodayPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const name = session?.user?.name ?? session?.user?.email ?? "there";

  const [assignmentCount, resultsCount, nextAssignment, tasksDueToday] = userId
    ? await Promise.all([
        prisma.programAssignment.count({ where: { userId } }),
        prisma.dNAResult.count({ where: { userId } }),
        prisma.programAssignment.findFirst({
          where: { userId },
          orderBy: { startDate: "asc" },
          include: { program: { select: { id: true, name: true } } },
        }),
        (async () => {
          const now = new Date();
          const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          return prisma.task.count({
            where: {
              assignedToUserId: userId,
              completedAt: null,
              dueDate: { gte: now, lte: todayEnd },
            },
          });
        })(),
      ]).then(([a, r, n, t]) => [a, r, n, t])
    : [0, 0, null, 0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Today
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Welcome back, {name}. Here&apos;s your focus for today.
      </p>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          What&apos;s on today
        </h2>
        {assignmentCount === 0 ? (
          <>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              No workouts scheduled yet. Your coach may assign programs and
              workouts here once your training calendar is set up.
            </p>
            <Link
              href="/programs"
              className="mt-3 inline-block font-medium text-[var(--brand)] hover:underline"
            >
              View programs →
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {nextAssignment && "program" in nextAssignment
                ? `Next up: ${nextAssignment.program.name}`
                : "You have program assignments. Open Programs to see details and track workouts."}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/programs"
                className="font-medium text-[var(--brand)] hover:underline"
              >
                View programs →
              </Link>
              <Link
                href="/progress"
                className="font-medium text-[var(--brand)] hover:underline"
              >
                Log progress →
              </Link>
            </div>
          </>
        )}
      </section>

      <div className="mt-6 flex flex-wrap gap-4">
        {tasksDueToday > 0 && (
          <Link
            href="/tasks"
            className="font-medium text-zinc-900 underline hover:no-underline dark:text-zinc-50"
          >
            {tasksDueToday} task{tasksDueToday !== 1 ? "s" : ""} due today →
          </Link>
        )}
        {resultsCount > 0 && (
          <Link
            href="/results"
            className="font-medium text-zinc-900 underline hover:no-underline dark:text-zinc-50"
          >
            View your DNA results →
          </Link>
        )}
        <Link
          href="/inbox"
          className="font-medium text-zinc-900 underline hover:no-underline dark:text-zinc-50"
        >
          Inbox →
        </Link>
      </div>
    </div>
  );
}
