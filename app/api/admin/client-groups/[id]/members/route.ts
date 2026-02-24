import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: groupId } = await params;
  const group = await prisma.clientGroup.findUnique({ where: { id: groupId } });
  if (!group) return apiError("Group not found.", 404);
  try {
    const body = await request.json();
    const { userIds } = body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return apiError("userIds must be a non-empty array.", 400);
    }
    const added: string[] = [];
    for (const userId of userIds) {
      if (typeof userId !== "string") continue;
      const client = await prisma.user.findFirst({
        where: { id: userId, role: Role.client },
      });
      if (!client) continue;
      try {
        await prisma.userClientGroup.upsert({
          where: { userId_groupId: { userId, groupId } },
          create: { userId, groupId },
          update: {},
        });
        added.push(userId);
      } catch {
        // already in group
      }
    }
    return NextResponse.json({ added });
  } catch (e) {
    console.error("Add group members error:", e);
    return apiError("Failed to add members.", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: groupId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return apiError("userId query parameter is required.", 400);
  }
  const group = await prisma.clientGroup.findUnique({ where: { id: groupId } });
  if (!group) return apiError("Group not found.", 404);
  try {
    await prisma.userClientGroup.delete({
      where: { userId_groupId: { userId, groupId } },
    });
    return NextResponse.json({ removed: userId });
  } catch {
    return apiError("Member not in group or could not be removed.", 404);
  }
}
