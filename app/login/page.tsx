import Link from "next/link";
import { Suspense } from "react";
import { BrandFooter } from "@/components/brand-footer";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode;
  const heading =
    mode === "admin"
      ? "Log in to admin dashboard"
      : mode === "client"
        ? "Log in to client app"
        : "Log in to GNR8";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
        {!mode && (
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/login?mode=admin"
              className="rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
            >
              Log in as admin
            </Link>
            <Link
              href="/login?mode=client"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Log in as client
            </Link>
          </div>
        )}
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {heading}
        </h1>
        <Suspense fallback={<div className="h-[280px] w-full max-w-sm animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />}>
          <LoginForm />
        </Suspense>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-[var(--brand)] hover:underline">
            Sign up
          </Link>
        </p>
      </main>
      <BrandFooter />
    </div>
  );
}
