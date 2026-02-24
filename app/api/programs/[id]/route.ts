import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: programId } = await params;
  const assignment = await prisma.programAssignment.findFirst({
    where: { userId: session.user.id, programId },
    include: { program: true },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Program not found or not assigned to you." }, { status: 404 });
  }
  return NextResponse.json(assignment);
}
