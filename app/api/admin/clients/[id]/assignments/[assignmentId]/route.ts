import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: userId, assignmentId } = await params;
  const assignment = await prisma.programAssignment.findFirst({
    where: { id: assignmentId, user: { id: userId, role: Role.client } },
  });
  if (!assignment) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  try {
    await prisma.programAssignment.delete({ where: { id: assignmentId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Remove assignment error:", e);
    return NextResponse.json({ error: "Failed to remove assignment." }, { status: 500 });
  }
}
