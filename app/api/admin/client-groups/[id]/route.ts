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
  const group = await prisma.clientGroup.findUnique({
    where: { id },
    include: {
      users: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!group) return NextResponse.json({ error: "Group not found." }, { status: 404 });
  return NextResponse.json(group);
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
  const existing = await prisma.clientGroup.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Group not found." }, { status: 404 });
  try {
    const body = await request.json();
    const { name, description } = body;
    const data: { name?: string; description?: string | null } = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (description !== undefined) data.description = typeof description === "string" ? description.trim() || null : null;
    const group = await prisma.clientGroup.update({
      where: { id },
      data,
    });
    return NextResponse.json(group);
  } catch (e) {
    console.error("Update client group error:", e);
    return NextResponse.json({ error: "Failed to update group." }, { status: 500 });
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
    await prisma.clientGroup.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete client group error:", e);
    return NextResponse.json({ error: "Group not found or could not be deleted." }, { status: 500 });
  }
}
