import Link from "next/link";
import { prisma } from "@/lib/db";
import { DeleteProgramButton } from "./delete-program-button";

export default async function AdminProgramsPage() {
  const programs = await prisma.program.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { assignments: true } } },
  });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Programs
        </h1>
        <Link
          href="/admin/programs/new"
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:text-white dark:hover:bg-[var(--brand-hover)]"
        >
          Add program
        </Link>
      </div>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Create programs and assign them to clients. Clients see their assigned programs under Programs.
      </p>
      {programs.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          No programs yet. Add one to get started.
        </p>
      ) : (
        <ul className="space-y-2">
          {programs.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/programs/${p.id}`}
                  className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                >
                  {p.name}
                </Link>
                {!p.isActive && (
                  <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                    Inactive
                  </span>
                )}
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {p._count.assignments} assigned
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/programs/${p.id}/edit`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Edit
                </Link>
                <DeleteProgramButton programId={p.id} programName={p.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
