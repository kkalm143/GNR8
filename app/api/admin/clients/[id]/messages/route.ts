import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id: clientId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: clientId, role: "client", archivedAt: null },
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  let body: { subject?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { subject, body: messageBody } = body;
  if (!messageBody || typeof messageBody !== "string" || !messageBody.trim()) {
    return NextResponse.json({ error: "Body is required." }, { status: 400 });
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
