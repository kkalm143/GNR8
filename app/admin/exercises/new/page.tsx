import Link from "next/link";
import { NewExerciseForm } from "../new-exercise-form";

export default function NewExercisePage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/exercises"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Exercise library
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Add exercise
      </h1>
      <NewExerciseForm />
    </div>
  );
}
