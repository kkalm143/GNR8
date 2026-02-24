import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
  if (!program) return NextResponse.json({ error: "Program not found." }, { status: 404 });
  return NextResponse.json(program);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, description, content, isActive, displayOrder } = body;
    const data: Record<string, unknown> = {};
    if (typeof name === "string") data.name = name;
    if (description !== undefined) data.description = typeof description === "string" ? description : null;
    if (content !== undefined) data.content = typeof content === "string" ? content : null;
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (typeof displayOrder === "number") data.displayOrder = displayOrder;
    const program = await prisma.program.update({
      where: { id },
      data,
    });
    return NextResponse.json(program);
  } catch (e) {
    console.error("Update program error:", e);
    return NextResponse.json({ error: "Failed to update program." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.program.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete program error:", e);
    return NextResponse.json({ error: "Failed to delete program." }, { status: 500 });
  }
}
