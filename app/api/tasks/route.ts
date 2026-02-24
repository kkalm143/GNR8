import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role === "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const tasks = await prisma.task.findMany({
    where: { assignedToUserId: session.user.id },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      assignedBy: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(tasks);
}
