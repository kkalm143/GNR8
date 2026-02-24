import Link from "next/link";

export function BrandFooter({ variant = "default" }: { variant?: "default" | "on-dark" }) {
  const isOnDark = variant === "on-dark";
  return (
    <footer
      className={`mt-auto border-t py-6 text-center text-sm ${
        isOnDark
          ? "border-white/20 text-white/80"
          : "border-[var(--border-subtle)] text-zinc-500 dark:text-zinc-400"
      }`}
    >
      <p>
        © GNR8 · DNA-based personal training ·{" "}
        <a
          href="https://www.gnr8.org"
          target="_blank"
          rel="noopener noreferrer"
          className={isOnDark ? "font-medium text-white underline hover:no-underline" : "text-[var(--brand)] hover:underline"}
        >
          gnr8.org
        </a>
      </p>
    </footer>
  );
}
