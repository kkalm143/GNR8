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
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id: clientId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: clientId, role: "client", archivedAt: null },
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  let body: { title?: string; description?: string; dueDate?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const task = await prisma.task.create({
    data: {
      assignedToUserId: client.id,
      assignedByUserId: session.user.id,
      title,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });
  return NextResponse.json(task, { status: 201 });
}
