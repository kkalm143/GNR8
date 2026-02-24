import { NextResponse } from "next/server";
import { requireClient, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClient();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const message = await prisma.message.findFirst({
    where: { id, recipientId: session.user.id },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });
  if (!message) {
    return apiError("Not found", 404);
  }
  return NextResponse.json(message);
}
