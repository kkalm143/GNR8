import Link from "next/link";
import { NewDNAFieldForm } from "./new-field-form";

export default function NewDNAFieldPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/dna/fields"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← DNA interpretation fields
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Add interpretation field
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        e.g. &quot;Mobility Score&quot; (scale 1–10) or a category with options.
      </p>
      <NewDNAFieldForm className="mt-6 max-w-md" />
    </div>
  );
}
