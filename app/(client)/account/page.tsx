import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditAccountForm } from "./edit-account-form";
import { ShowOnboardingAgainButton } from "./show-onboarding-again-button";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { clientProfile: true },
  });
  if (!user) redirect("/login");
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        You
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Your profile and settings. Update your details below; your login email cannot be changed.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Link href="/results" className="text-sm font-medium text-[var(--brand)] hover:underline">
          View DNA results →
        </Link>
        <ShowOnboardingAgainButton />
      </div>
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
      />
    </div>
  );
}
