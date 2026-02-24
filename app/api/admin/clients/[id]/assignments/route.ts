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
  const { id: userId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: userId, role: Role.client },
  });
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  try {
    const body = await request.json();
    const { programId, startDate, endDate } = body;
    if (!programId || typeof programId !== "string") {
      return NextResponse.json({ error: "programId is required." }, { status: 400 });
    }
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) return NextResponse.json({ error: "Program not found." }, { status: 404 });
    const existing = await prisma.programAssignment.findUnique({
      where: { userId_programId: { userId, programId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Client is already assigned to this program." }, { status: 409 });
    }
    const assignment = await prisma.programAssignment.create({
      data: {
        userId,
        programId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: { program: { select: { id: true, name: true } } },
    });
    return NextResponse.json(assignment);
  } catch (e) {
    console.error("Assign program error:", e);
    return NextResponse.json({ error: "Failed to assign program." }, { status: 500 });
  }
}
