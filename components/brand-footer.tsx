import Link from "next/link";

export function BrandFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <p>
        © GNR8 · DNA-based personal training ·{" "}
        <a
          href="https://www.gnr8.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--brand)] hover:underline"
        >
          gnr8.org
        </a>
      </p>
    </footer>
  );
}
