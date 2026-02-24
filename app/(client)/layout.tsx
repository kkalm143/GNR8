import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClientNav } from "@/components/client-nav";
import { OnboardingGate } from "@/components/onboarding-gate";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role === "admin") redirect("/admin");
  return (
    <OnboardingGate>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link
              href="/today"
              className="font-semibold text-zinc-900 dark:text-zinc-50 transition-colors hover:text-[var(--brand)]"
            >
              Genr8
            </Link>
            <ClientNav />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </OnboardingGate>
  );
}
