"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { getSectionToken } from "@/lib/section-token";

const navItems = [
  { href: "/today", label: "Today" },
  { href: "/programs", label: "Programs" },
  { href: "/progress", label: "Progress" },
  { href: "/tasks", label: "Tasks" },
  { href: "/inbox", label: "Inbox" },
  { href: "/coaching", label: "Coaching" },
  { href: "/account", label: "You" },
] as const;

export function ClientNav({
  isAdminViewingAsClient = false,
}: {
  isAdminViewingAsClient?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-3">
      {isAdminViewingAsClient && (
        <Link
          href="/api/auth/view-as-clear"
          className="text-sm font-medium text-[var(--brand)] hover:underline"
        >
          Back to admin
        </Link>
      )}
      {navItems.map(({ href, label }) => {
        const isActive =
          pathname === href || (href !== "/today" && pathname?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium transition-colors ${
              isActive
                ? "text-[var(--section-primary)] dark:text-[var(--section-primary)]"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
            style={isActive ? { color: `var(${getSectionToken(href)})` } : undefined}
          >
            {label}
          </Link>
        );
      })}
      <Link
        href="/results"
        className={`text-sm font-medium transition-colors ${
          pathname?.startsWith("/results")
            ? "text-[var(--section-cool)]"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        }`}
        style={
          pathname?.startsWith("/results")
            ? { color: "var(--section-cool)" }
            : undefined
        }
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
