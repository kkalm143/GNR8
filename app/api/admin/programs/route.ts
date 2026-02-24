import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const programs = await prisma.program.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { assignments: true } } },
  });
  return NextResponse.json(programs);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  try {
    const body = await request.json();
    const { name, description, content, isActive, displayOrder } = body;
    if (!name || typeof name !== "string") {
      return apiError("Name is required.", 400);
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
    return apiError("Failed to create program.", 500);
  }
}
