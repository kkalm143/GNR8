"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function AdminNav() {
  return (
    <nav className="flex items-center gap-4">
      <Link
        href="/admin"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Dashboard
      </Link>
      <Link
        href="/admin/clients"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Clients
      </Link>
      <Link
        href="/admin/groups"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Groups
      </Link>
      <Link
        href="/admin/dna/fields"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        DNA fields
      </Link>
      <Link
        href="/admin/programs"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Programs
      </Link>
      <Link
        href="/admin/account"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Account
      </Link>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Client app
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Log out
      </button>
    </nav>
  );
}
