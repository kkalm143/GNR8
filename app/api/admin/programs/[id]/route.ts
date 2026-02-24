import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      assignments: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { assignedAt: "desc" },
      },
    },
  });
  if (!program) return apiError("Program not found.", 404);
  return NextResponse.json(program);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, description, content, isActive, displayOrder, tags } = body;
    const data: Record<string, unknown> = {};
    if (typeof name === "string") data.name = name;
    if (description !== undefined) data.description = typeof description === "string" ? description : null;
    if (content !== undefined) data.content = typeof content === "string" ? content : null;
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (typeof displayOrder === "number") data.displayOrder = displayOrder;
    if (tags !== undefined) data.tags = Array.isArray(tags) && tags.every((t) => typeof t === "string") ? tags : null;
    const program = await prisma.program.update({
      where: { id },
      data,
    });
    return NextResponse.json(program);
  } catch (e) {
    console.error("Update program error:", e);
    return apiError("Failed to update program.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  try {
    await prisma.program.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete program error:", e);
    return apiError("Failed to delete program.", 500);
  }
}
