import Link from "next/link";

type Group = {
  id: string;
  name: string;
  description: string | null;
  _count: { users: number };
};

export function GroupsList({ groups }: { groups: Group[] }) {
  if (groups.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        No groups yet. Create one to segment clients.
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Clients
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {groups.map((g) => (
            <tr key={g.id}>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {g.name}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                {g.description ?? "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-zinc-600 dark:text-zinc-400">
                {g._count.users}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                <Link
                  href={`/admin/groups/${g.id}`}
                  className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
