import Link from "next/link";
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
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            GNR8
          </h1>
          <p className="max-w-lg text-xl text-[var(--brand)] font-semibold">
            Your genetics. Your coach. Your breakthrough.
          </p>
          <p className="max-w-md text-zinc-600 dark:text-zinc-400">
            Break through plateaus with a hyper-personalized fitness plan built
            from your genetics, your lifestyle, and your goals. Research-validated,
            guided by a real trainer and scientist.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-[var(--brand)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-zinc-300 px-6 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Sign up
          </Link>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <a
            href="https://www.gnr8.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand)] hover:underline"
          >
            Learn more at gnr8.org
          </a>
        </p>
      </main>
      <BrandFooter />
    </div>
  );
}
