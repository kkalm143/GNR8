import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskList } from "./task-list";

export default async function TasksPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const tasks = await prisma.task.findMany({
    where: { assignedToUserId: userId },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      assignedBy: { select: { id: true, name: true } },
    },
  });

  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const overdue = tasks.filter((t) => !t.completedAt && t.dueDate && t.dueDate < now);
  const dueToday = tasks.filter(
    (t) => !t.completedAt && t.dueDate && t.dueDate >= now && t.dueDate <= todayEnd
  );
  const upcoming = tasks.filter(
    (t) => !t.completedAt && (!t.dueDate || t.dueDate > todayEnd)
  );
  const completed = tasks.filter((t) => t.completedAt);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <span className="border-b-2 border-[var(--section-warm)] pb-0.5">Tasks</span>
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Tasks assigned by your coach. Mark them complete when done.
      </p>
      {tasks.length === 0 ? (
        <p
          className="mt-8 rounded-xl border-l-4 border-[var(--section-warm)] bg-[var(--surface-card)] py-8 text-center text-sm text-zinc-600 dark:text-zinc-400"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          No tasks assigned yet.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {overdue.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Overdue
              </h2>
              <TaskList tasks={overdue} />
            </section>
          )}
          {dueToday.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Due today
              </h2>
              <TaskList tasks={dueToday} />
            </section>
          )}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Upcoming
              </h2>
              <TaskList tasks={upcoming} />
            </section>
          )}
          {completed.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-500 dark:text-zinc-400">
                Completed
              </h2>
              <TaskList tasks={completed} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
