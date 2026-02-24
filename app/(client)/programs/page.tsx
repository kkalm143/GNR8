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
        My programs
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Programs assigned to you by your coach.
      </p>
      {assignments.length === 0 ? (
        <p className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          No programs assigned yet. Your coach will assign programs for you here.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {assignments.map((a) => (
            <li key={a.id}>
              <Link
                href={`/programs/${a.program.id}`}
                className="block rounded-lg border border-zinc-200 px-4 py-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
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
