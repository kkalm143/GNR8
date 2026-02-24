"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/today", label: "Today" },
  { href: "/programs", label: "Programs" },
  { href: "/progress", label: "Progress" },
  { href: "/tasks", label: "Tasks" },
  { href: "/inbox", label: "Inbox" },
  { href: "/coaching", label: "Coaching" },
  { href: "/account", label: "You" },
] as const;

export function ClientNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-3">
      {navItems.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium transition-colors ${
            pathname === href || (href !== "/today" && pathname?.startsWith(href))
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
        >
          {label}
        </Link>
      ))}
      <Link
        href="/results"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Results
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
