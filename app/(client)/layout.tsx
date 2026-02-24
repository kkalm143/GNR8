import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { ClientNav } from "@/components/client-nav";
import { OnboardingGate } from "@/components/onboarding-gate";
import {
  getViewAsFromCookies,
  shouldRedirectAdminAwayFromClientApp,
} from "@/lib/view-as-client";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  const cookieStore = await cookies();
  const viewAs = getViewAsFromCookies(cookieStore);
  if (shouldRedirectAdminAwayFromClientApp(role, viewAs)) redirect("/admin");
  const isAdminViewingAsClient =
    role === "admin" && viewAs === "client";
  return (
    <OnboardingGate>
      <div className="min-h-screen bg-gradient-page">
        <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-sm">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link
              href="/today"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Image src="/logo.svg" alt="GNR8" width={96} height={28} className="h-7 w-auto" />
            </Link>
            <ClientNav isAdminViewingAsClient={isAdminViewingAsClient} />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </OnboardingGate>
  );
}
