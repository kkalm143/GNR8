import Link from "next/link";
import { NewGroupForm } from "../new-group-form";

export default function NewGroupPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/groups"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Groups
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        New group
      </h1>
      <NewGroupForm />
    </div>
  );
}
