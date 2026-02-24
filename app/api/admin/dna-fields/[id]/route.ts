import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
    return NextResponse.json({ error: "Failed to update field." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.dNAInterpretationField.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete DNA field error:", e);
    return NextResponse.json({ error: "Failed to delete field." }, { status: 500 });
  }
}
