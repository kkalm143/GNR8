import Link from "next/link";
import { ImportCsvForm } from "./import-csv-form";

export default function ImportClientsPage() {
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
        Import clients from CSV
      </h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Upload a CSV with an <strong>email</strong> column (required). Optional columns: name, phone, timezone, dateOfBirth. Default password for new clients: changeme123
      </p>
      <ImportCsvForm />
    </div>
  );
}
