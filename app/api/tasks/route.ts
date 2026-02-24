import { NextResponse } from "next/server";
import { requireClient } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireClient();
  if (session instanceof NextResponse) return session;
  const tasks = await prisma.task.findMany({
    where: { assignedToUserId: session.user.id },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      assignedBy: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(tasks);
}
