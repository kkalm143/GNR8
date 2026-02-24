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
  const existing = await prisma.message.findFirst({
    where: { id, recipientId: session.user.id },
  });
  if (!existing) {
    return apiError("Not found", 404);
  }
  const updated = await prisma.message.update({
    where: { id },
    data: { readAt: new Date() },
  });
  return NextResponse.json(updated);
}
