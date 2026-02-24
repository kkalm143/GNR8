import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  const { id: programId } = await params;
  const assignment = await prisma.programAssignment.findFirst({
    where: { userId: session.user.id, programId },
    include: { program: true },
  });
  if (!assignment) {
    return apiError("Program not found or not assigned to you.", 404);
  }
  return NextResponse.json(assignment);
}
