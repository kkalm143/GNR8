import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: userId, assignmentId } = await params;
  const assignment = await prisma.programAssignment.findFirst({
    where: { id: assignmentId, user: { id: userId, role: Role.client } },
  });
  if (!assignment) return apiError("Assignment not found.", 404);
  try {
    await prisma.programAssignment.delete({ where: { id: assignmentId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Remove assignment error:", e);
    return apiError("Failed to remove assignment.", 500);
  }
}
