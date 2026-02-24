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
        My DNA results
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Your DNA-based insights and interpretation scores from your coach.
      </p>
      {results.length === 0 ? (
        <p className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          No results yet. Your coach will add your DNA results here when ready.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={`/results/${r.id}`}
                className="block rounded-lg border border-zinc-200 px-4 py-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
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
