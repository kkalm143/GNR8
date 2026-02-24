import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: clientId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: clientId, role: "client", archivedAt: null },
  });
  if (!client) {
    return apiError("Client not found", 404);
  }
  let body: { subject?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON", 400);
  }
  const { subject, body: messageBody } = body;
  if (!messageBody || typeof messageBody !== "string" || !messageBody.trim()) {
    return apiError("Body is required.", 400);
  }
  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: client.id,
      subject: typeof subject === "string" && subject.trim() ? subject.trim() : null,
      body: messageBody.trim(),
    },
  });
  return NextResponse.json(message, { status: 201 });
}
