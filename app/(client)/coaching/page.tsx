import Link from "next/link";

export default function CoachingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <span className="border-b-2 border-[var(--section-primary)] pb-0.5">Coaching</span>
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Messages and resources from your coach. Check your{" "}
        <Link href="/inbox" className="font-medium text-[var(--brand)] hover:underline">
          Inbox
        </Link>{" "}
        for announcements, and your{" "}
        <Link href="/programs" className="font-medium text-[var(--brand)] hover:underline">
          Programs
        </Link>{" "}
        for assigned content.
      </p>
      <div
        className="mt-8 rounded-xl border-l-4 border-[var(--section-primary)] bg-[var(--surface-card)] p-6 text-center dark:bg-[var(--surface-card)]"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          More coaching resources and content will appear here as your coach adds
          them.
        </p>
      </div>
    </div>
  );
}
