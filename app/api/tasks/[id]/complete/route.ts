import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role === "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, assignedToUserId: session.user.id },
  });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const updated = await prisma.task.update({
    where: { id },
    data: { completedAt: new Date() },
  });
  return NextResponse.json(updated);
}
