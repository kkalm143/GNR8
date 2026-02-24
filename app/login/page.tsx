import Link from "next/link";
import { Suspense } from "react";
import { BrandFooter } from "@/components/brand-footer";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Log in to Genr8
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
