import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditExerciseForm } from "../../edit-exercise-form";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) notFound();
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
        Edit exercise
      </h1>
      <EditExerciseForm
        exerciseId={id}
        initial={{
          name: exercise.name,
          description: exercise.description ?? "",
          demoVideoUrl: exercise.demoVideoUrl ?? "",
        }}
      />
    </div>
  );
}
