import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MarkAsReadButton } from "./mark-as-read-button";

export default async function InboxMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { id } = await params;
  const message = await prisma.message.findFirst({
    where: { id, recipientId: userId },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  if (!message) notFound();

  return (
    <div>
      <Link
        href="/inbox"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Back to Inbox
      </Link>
      <article className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {message.subject || "(No subject)"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              From {message.sender.name ?? "Coach"} ·{" "}
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
          {!message.readAt && (
            <MarkAsReadButton messageId={message.id} className="shrink-0" />
          )}
        </div>
        <div className="mt-4 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
          {message.body}
        </div>
      </article>
    </div>
  );
}
