import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const template = await prisma.sectionTemplate.findUnique({ where: { id } });
  if (!template) return apiError("Template not found.", 404);
  return NextResponse.json(template);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const template = await prisma.sectionTemplate.findUnique({ where: { id } });
  if (!template) return apiError("Template not found.", 404);
  try {
    const body = await request.json();
    const { name, type, defaultDuration, defaultReps, metadata } = body;
    const data: Record<string, unknown> = {};
    if (typeof name === "string") data.name = name.trim() || template.name;
    if (typeof type === "string") data.type = type;
    if (defaultDuration !== undefined) data.defaultDuration = typeof defaultDuration === "number" ? defaultDuration : null;
    if (defaultReps !== undefined) data.defaultReps = typeof defaultReps === "string" ? defaultReps.trim() || null : null;
    if (metadata !== undefined) data.metadata = metadata && typeof metadata === "object" ? metadata : null;
    const updated = await prisma.sectionTemplate.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update section template error:", e);
    return apiError("Failed to update template.", 500);
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
    await prisma.sectionTemplate.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete section template error:", e);
    return apiError("Template not found or could not be deleted.", 500);
  }
}
