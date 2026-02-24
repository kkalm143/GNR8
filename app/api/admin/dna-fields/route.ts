import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const fields = await prisma.dNAInterpretationField.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(fields);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, type, min, max, options, displayOrder } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    const field = await prisma.dNAInterpretationField.create({
      data: {
        name,
        type: type === "category" ? "category" : "scale",
        min: type === "scale" && typeof min === "number" ? min : null,
        max: type === "scale" && typeof max === "number" ? max : null,
        options: type === "category" && Array.isArray(options) ? (options as string[]) : undefined,
        displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      },
    });
    return NextResponse.json(field);
  } catch (e) {
    console.error("Create DNA field error:", e);
    return NextResponse.json({ error: "Failed to create field." }, { status: 500 });
  }
}
