import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ClientResultsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const results = await prisma.dNAResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, summary: true, createdAt: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <span className="border-b-2 border-[var(--section-cool)] pb-0.5">My DNA results</span>
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Your DNA-based insights and interpretation scores from your coach.
      </p>
      {results.length === 0 ? (
        <p
          className="mt-8 rounded-xl border-l-4 border-[var(--section-cool)] bg-[var(--surface-card)] py-8 text-center text-sm text-zinc-600 dark:text-zinc-400"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          No results yet. Your coach will add your DNA results here when ready.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={`/results/${r.id}`}
                className="block rounded-xl border-l-4 border-[var(--section-cool)] bg-[var(--surface-card)] px-4 py-4 shadow-sm transition-shadow hover:shadow-md dark:bg-[var(--surface-card)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  Result from {new Date(r.createdAt).toLocaleDateString()}
                </span>
                {r.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {r.summary}
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
