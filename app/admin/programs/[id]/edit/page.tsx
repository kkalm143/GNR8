import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditProgramForm } from "./edit-program-form";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await prisma.program.findUnique({ where: { id } });
  if (!program) notFound();
  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/programs/${id}`}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← {program.name}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Edit program
      </h1>
      <EditProgramForm
        programId={id}
        initial={{
          name: program.name,
          description: program.description ?? "",
          content: program.content ?? "",
          isActive: program.isActive,
          displayOrder: program.displayOrder,
        }}
        className="mt-6 max-w-lg"
      />
    </div>
  );
}
