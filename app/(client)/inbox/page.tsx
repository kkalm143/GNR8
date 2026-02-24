import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function InboxPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const messages = await prisma.message.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <span className="border-b-2 border-[var(--section-warm)] pb-0.5">Inbox</span>
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Messages and announcements from your coach.
      </p>
      {messages.length === 0 ? (
        <p
          className="mt-8 rounded-xl border-l-4 border-[var(--section-warm)] bg-[var(--surface-card)] py-8 text-center text-sm text-zinc-600 dark:text-zinc-400"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          No messages yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {messages.map((m) => (
            <li key={m.id}>
              <Link
                href={`/inbox/${m.id}`}
                className={`block rounded-lg border px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                  m.readAt
                    ? "border-zinc-200 dark:border-zinc-800"
                    : "border-[var(--brand)]/30 bg-[var(--brand)]/5 dark:border-[var(--brand)]/40 dark:bg-[var(--brand)]/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {m.subject || "(No subject)"}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">
                      {m.body}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      {m.sender.name ?? "Coach"} ·{" "}
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!m.readAt && (
                    <span className="shrink-0 rounded-full bg-[var(--brand)] px-2 py-0.5 text-xs font-medium text-white">
                      New
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
