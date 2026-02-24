import Link from "next/link";
import { BrandFooter } from "@/components/brand-footer";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface)]" style={{ background: "var(--gradient-page)" }}>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
        <div className="w-full max-w-sm rounded-xl bg-[var(--surface-card)] p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Create your GNR8 account
          </h1>
          <RegisterForm />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--brand)] hover:underline">
            Log in
          </Link>
        </p>
      </main>
      <BrandFooter />
    </div>
  );
}
