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
  const group = await prisma.clientGroup.findUnique({
    where: { id },
    include: {
      users: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!group) return apiError("Group not found.", 404);
  return NextResponse.json(group);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const existing = await prisma.clientGroup.findUnique({ where: { id } });
  if (!existing) return apiError("Group not found.", 404);
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
    return apiError("Failed to update group.", 500);
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
    await prisma.clientGroup.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete client group error:", e);
    return apiError("Group not found or could not be deleted.", 500);
  }
}
