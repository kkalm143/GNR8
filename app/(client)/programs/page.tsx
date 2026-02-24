import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ClientProgramsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const assignments = await prisma.programAssignment.findMany({
    where: { userId },
    include: { program: true },
    orderBy: { assignedAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <span className="border-b-2 border-[var(--section-cool)] pb-0.5">My programs</span>
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Programs assigned to you by your coach.
      </p>
      {assignments.length === 0 ? (
        <p
          className="mt-8 rounded-xl border-l-4 border-[var(--section-cool)] bg-[var(--surface-card)] py-8 text-center text-sm text-zinc-600 dark:text-zinc-400"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          No programs assigned yet. Your coach will assign programs for you here.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {assignments.map((a) => (
            <li key={a.id}>
              <Link
                href={`/programs/${a.program.id}`}
                className="block rounded-xl border-l-4 border-[var(--section-cool)] bg-[var(--surface-card)] px-4 py-4 shadow-sm transition-shadow hover:shadow-md dark:bg-[var(--surface-card)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {a.program.name}
                </span>
                <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {a.status.replace("_", " ")} · Assigned {new Date(a.assignedAt).toLocaleDateString()}
                </span>
                {a.program.description && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {a.program.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
