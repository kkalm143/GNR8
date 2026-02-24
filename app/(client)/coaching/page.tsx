import Link from "next/link";

export default function CoachingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Coaching
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
      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          More coaching resources and content will appear here as your coach adds
          them.
        </p>
      </div>
    </div>
  );
}
