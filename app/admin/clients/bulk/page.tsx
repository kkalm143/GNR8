import Link from "next/link";
import { BulkAddForm } from "./bulk-add-form";

export default function BulkAddClientsPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/clients"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Clients
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Bulk add clients
      </h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Add between 2 and 8 clients at once. Email is required for each; other fields are optional. Default password: changeme123
      </p>
      <BulkAddForm />
    </div>
  );
}
