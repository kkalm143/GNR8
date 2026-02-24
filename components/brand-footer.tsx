import Link from "next/link";

export function BrandFooter({ variant = "default" }: { variant?: "default" | "on-dark" }) {
  const isOnDark = variant === "on-dark";
  return (
    <footer
      className={`mt-auto shrink-0 border-t py-6 text-center text-sm ${
        isOnDark
          ? "border-white/20 text-white/80"
          : "border-zinc-200 bg-white/60 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400"
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
