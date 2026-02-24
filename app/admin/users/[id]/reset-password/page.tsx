import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) notFound();
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
        Reset password
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Set a new password for {user.name ?? user.email}. They will need this password to log in.
      </p>
      <ResetPasswordForm userId={user.id} userEmail={user.email} className="mt-6 max-w-md" />
    </div>
  );
}
