import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const programs = await prisma.program.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { assignments: true } } },
  });
  return NextResponse.json(programs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, description, content, isActive, displayOrder } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    const program = await prisma.program.create({
      data: {
        name,
        description: typeof description === "string" ? description : null,
        content: typeof content === "string" ? content : null,
        isActive: typeof isActive === "boolean" ? isActive : true,
        displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      },
    });
    return NextResponse.json(program);
  } catch (e) {
    console.error("Create program error:", e);
    return NextResponse.json({ error: "Failed to create program." }, { status: 500 });
  }
}
