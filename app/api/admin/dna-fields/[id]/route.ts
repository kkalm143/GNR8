import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, type, min, max, options, displayOrder } = body;
    const data: Record<string, unknown> = {};
    if (typeof name === "string") data.name = name;
    if (type === "category" || type === "scale") data.type = type;
    if (type === "scale") {
      data.min = typeof min === "number" ? min : null;
      data.max = typeof max === "number" ? max : null;
      data.options = null;
    }
    if (type === "category" && Array.isArray(options)) data.options = options;
    if (typeof displayOrder === "number") data.displayOrder = displayOrder;
    const field = await prisma.dNAInterpretationField.update({
      where: { id },
      data,
    });
    return NextResponse.json(field);
  } catch (e) {
    console.error("Update DNA field error:", e);
    return apiError("Failed to update field.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  try {
    await prisma.dNAInterpretationField.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete DNA field error:", e);
    return apiError("Failed to delete field.", 500);
  }
}
