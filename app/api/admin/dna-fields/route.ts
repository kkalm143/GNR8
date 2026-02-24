import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const fields = await prisma.dNAInterpretationField.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(fields);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  try {
    const body = await request.json();
    const { name, type, min, max, options, displayOrder } = body;
    if (!name || typeof name !== "string") {
      return apiError("Name is required.", 400);
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
    return apiError("Failed to create field.", 500);
  }
}
