import { NextResponse } from "next/server";
import { requireClient } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireClient();
  if (session instanceof NextResponse) return session;
  const messages = await prisma.message.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(messages);
}
