import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: groupId } = await params;
  const group = await prisma.clientGroup.findUnique({ where: { id: groupId } });
  if (!group) return NextResponse.json({ error: "Group not found." }, { status: 404 });
  try {
    const body = await request.json();
    const { userIds } = body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "userIds must be a non-empty array." }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to add members." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: groupId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId query parameter is required." }, { status: 400 });
  }
  const group = await prisma.clientGroup.findUnique({ where: { id: groupId } });
  if (!group) return NextResponse.json({ error: "Group not found." }, { status: 404 });
  try {
    await prisma.userClientGroup.delete({
      where: { userId_groupId: { userId, groupId } },
    });
    return NextResponse.json({ removed: userId });
  } catch {
    return NextResponse.json({ error: "Member not in group or could not be removed." }, { status: 404 });
  }
}
