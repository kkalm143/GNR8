import Link from "next/link";
import { CreateUserForm } from "./create-user-form";

export default function NewUserPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Users
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Add user
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Create an admin or client account. Clients get a full client profile and appear in Clients.
      </p>
      <CreateUserForm className="mt-6 max-w-md" />
    </div>
  );
}
