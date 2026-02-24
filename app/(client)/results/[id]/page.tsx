import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ClientResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const { id } = await params;
  const result = await prisma.dNAResult.findFirst({
    where: { id, userId },
  });
  if (!result) notFound();
  const fields = await prisma.dNAInterpretationField.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, type: true, min: true, max: true, options: true },
  });
  const fieldValues = (result.fieldValues as Record<string, string | number> | null) ?? {};
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/results"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← My DNA results
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        DNA result
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {new Date(result.createdAt).toLocaleDateString()}
      </p>
      {result.summary && (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {result.summary}
        </p>
      )}
      {result.rawFileUrl && (
        <p className="mt-2">
          <a
            href={result.rawFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            View lab file →
          </a>
        </p>
      )}
      {fields.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Scores &amp; interpretation
          </h2>
          <dl className="mt-3 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            {fields.map((f) => {
              const value = fieldValues[f.id];
              const display =
                value !== undefined && value !== null && value !== ""
                  ? String(value)
                  : "—";
              return (
                <div key={f.id} className="flex justify-between gap-4">
                  <dt className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {f.name}
                    {f.type === "scale" && f.min != null && f.max != null && (
                      <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-400">
                        ({f.min}–{f.max})
                      </span>
                    )}
                  </dt>
                  <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                    {display}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </div>
  );
}
