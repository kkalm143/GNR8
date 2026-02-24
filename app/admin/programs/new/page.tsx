import Link from "next/link";
import { NewProgramForm } from "./new-program-form";

export default function NewProgramPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/programs"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Programs
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Add program
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Create a program to assign to clients. Add a name, optional description, and instructions.
      </p>
      <NewProgramForm className="mt-6 max-w-lg" />
    </div>
  );
}
