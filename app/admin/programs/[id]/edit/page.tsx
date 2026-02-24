import { redirect } from "next/navigation";

export default async function EditProgramRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/programs/${id}`);
}
