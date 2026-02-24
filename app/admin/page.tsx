import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Clients, DNA results, and programs will be managed here.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/admin/clients"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-4 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <span className="font-medium">Clients</span>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage client accounts and profiles
          </p>
        </Link>
        <Link
          href="/admin/dna/fields"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-4 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <span className="font-medium">DNA interpretation fields</span>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Define scale and category fields for DNA results
          </p>
        </Link>
        <Link
          href="/admin/programs"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-4 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <span className="font-medium">Programs</span>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Create programs and assign them to clients
          </p>
        </Link>
      </div>
    </div>
  );
}
