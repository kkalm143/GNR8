import Link from "next/link";
import { CreateClientForm } from "./create-client-form";

export default function NewClientPage() {
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
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Add client
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Create a new client account. They can log in with their email and the password you set (or the default).
      </p>
      <CreateClientForm className="mt-6 max-w-md" />
    </div>
  );
}
