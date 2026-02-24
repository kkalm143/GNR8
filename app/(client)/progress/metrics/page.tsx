import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddMetricForm } from "./add-metric-form";

export default async function BodyMetricsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const entries = await prisma.progressEntry.findMany({
    where: {
      userId,
      type: { in: ["body_metric", "measurement"] },
    },
    orderBy: { createdAt: "desc" },
  });

  const byKey = new Map<string, typeof entries>();
  for (const e of entries) {
    const key = e.content.split(/[:\s]/)[0]?.toLowerCase() || "other";
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(e);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Body metrics
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Track weight, measurements, and other metrics over time.
      </p>
      <Link
        href="/progress"
        className="mt-4 inline-block text-sm font-medium text-[var(--brand)] hover:underline"
      >
        ← Back to Progress
      </Link>
      <AddMetricForm className="mt-6 max-w-md" />
      {entries.length === 0 ? (
        <p className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          No metrics logged yet. Add one above.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          {Array.from(byKey.entries()).map(([key, list]) => (
            <section key={key}>
              <h2 className="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-50">
                {key}
              </h2>
              <ul className="mt-2 space-y-2">
                {list.slice(0, 20).map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-800"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {e.content}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-500">
                      {(e.loggedAt ? new Date(e.loggedAt) : new Date(e.createdAt)).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
              {list.length > 20 && (
                <p className="mt-2 text-sm text-zinc-500">
                  +{list.length - 20} more
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
