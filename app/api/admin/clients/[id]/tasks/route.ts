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
  let body: { title?: string; description?: string; dueDate?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON", 400);
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return apiError("Title is required.", 400);
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
