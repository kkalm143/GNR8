import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditAccountForm } from "@/app/(client)/account/edit-account-form";

export default async function AdminAccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { clientProfile: true },
  });
  if (!user) redirect("/login");
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Account
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Update your profile. Your login email cannot be changed.
      </p>
      <EditAccountForm
        className="mt-6 max-w-md"
        initial={{
          email: user.email,
          name: user.name ?? "",
          phone: user.clientProfile?.phone ?? "",
          timezone: user.clientProfile?.timezone ?? "",
          dateOfBirth: user.clientProfile?.dateOfBirth
            ? user.clientProfile.dateOfBirth.toISOString().slice(0, 10)
            : "",
        }}
        backHref="/admin"
        backLabel="Back to dashboard"
      />
    </div>
  );
}
