import { NextResponse } from "next/server";
import { requireClient, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClient();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, assignedToUserId: session.user.id },
  });
  if (!task) {
    return apiError("Not found", 404);
  }
  const updated = await prisma.task.update({
    where: { id },
    data: { completedAt: new Date() },
  });
  return NextResponse.json(updated);
}
