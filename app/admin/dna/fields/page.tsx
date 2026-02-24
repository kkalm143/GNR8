import Link from "next/link";
import { prisma } from "@/lib/db";
import { DeleteFieldButton } from "./delete-field-button";

export default async function DNAFieldsPage() {
  const fields = await prisma.dNAInterpretationField.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          DNA interpretation fields
        </h1>
        <Link
          href="/admin/dna/fields/new"
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:text-white dark:hover:bg-[var(--brand-hover)]"
        >
          Add field
        </Link>
      </div>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Define the scores Nicole assigns per client (e.g. Mobility Score 1–10). These appear when adding or editing a DNA result.
      </p>
      {fields.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          No fields yet. Add one (e.g. &quot;Mobility Score&quot;, scale 1–10) to get started.
        </p>
      ) : (
        <ul className="space-y-2">
          {fields.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <div>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {f.name}
                </span>
                <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {f.type === "scale" && f.min != null && f.max != null
                    ? `Scale ${f.min}–${f.max}`
                    : f.type === "category" && Array.isArray(f.options)
                      ? `Category: ${(f.options as string[]).join(", ")}`
                      : f.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/dna/fields/${f.id}/edit`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Edit
                </Link>
                <DeleteFieldButton fieldId={f.id} fieldName={f.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
