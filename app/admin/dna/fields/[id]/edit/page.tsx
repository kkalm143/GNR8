import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditDNAFieldForm } from "./edit-field-form";

export default async function EditDNAFieldPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const field = await prisma.dNAInterpretationField.findUnique({
    where: { id },
  });
  if (!field) notFound();
  const options = Array.isArray(field.options) ? (field.options as string[]).join(", ") : "";
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/dna/fields"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← DNA interpretation fields
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Edit field: {field.name}
      </h1>
      <EditDNAFieldForm
        fieldId={id}
        initial={{
          name: field.name,
          type: field.type as "scale" | "category",
          min: field.min ?? 1,
          max: field.max ?? 10,
          options,
          displayOrder: field.displayOrder,
        }}
        className="mt-6 max-w-md"
      />
    </div>
  );
}
