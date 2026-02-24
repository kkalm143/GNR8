import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BrandFooter } from "@/components/brand-footer";
import { getViewAsFromCookies } from "@/lib/view-as-client";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    const cookieStore = await cookies();
    const viewAs = getViewAsFromCookies(cookieStore);
    if (viewAs === "client") redirect("/dashboard");
    if (role === "admin") redirect("/admin");
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--gradient-hero)" }}>
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image src="/logo.svg" alt="GNR8" width={160} height={48} className="h-12 w-auto brightness-0 invert" />
          <p className="max-w-lg text-xl font-semibold text-white drop-shadow-sm">
            Your genetics. Your coach. Your breakthrough.
          </p>
          <p className="max-w-md text-white/90">
            Break through plateaus with a hyper-personalized fitness plan built
            from your genetics, your lifestyle, and your goals. Research-validated,
            guided by a real trainer and scientist.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded-xl px-6 py-3 font-medium text-white transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-800 shadow-md"
            style={{ background: "var(--gradient-cta)" }}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-xl border-2 border-white/50 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 dark:border-white/30 dark:bg-white/5 dark:hover:bg-white/15"
          >
            Sign up
          </Link>
        </div>
        <p className="text-sm text-white/80">
          <a
            href="https://www.gnr8.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white underline hover:no-underline"
          >
            Learn more at gnr8.org
          </a>
        </p>
      </main>
      <BrandFooter variant="on-dark" />
    </div>
  );
}
