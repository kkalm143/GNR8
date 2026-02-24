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
  const user = await prisma.user.findFirst({
    where: { id, role: "client" },
    include: { clientProfile: true, dnaResults: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) return apiError("Client not found.", 404);
  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const user = await prisma.user.findFirst({
    where: { id, role: "client" },
    include: { clientProfile: true },
  });
  if (!user) return apiError("Client not found.", 404);
  try {
    const body = await request.json();
    const { name, email, phone, dateOfBirth, timezone, archived } = body;
    const profileId = user.clientProfile?.id;
    const userData: { name?: string; email?: string; archivedAt?: Date | null } = {};
    if (typeof name === "string") userData.name = name;
    if (typeof email === "string" && email !== user.email) userData.email = email;
    if (archived === true) userData.archivedAt = new Date();
    if (archived === false) userData.archivedAt = null;
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: userData,
      }),
      profileId
        ? prisma.clientProfile.update({
            where: { id: profileId },
            data: {
              ...(typeof phone === "string" && { phone }),
              ...(typeof timezone === "string" && { timezone }),
              ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
            },
          })
        : prisma.clientProfile.create({
            data: {
              userId: id,
              phone: typeof phone === "string" ? phone : null,
              timezone: typeof timezone === "string" ? timezone : null,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            },
          }),
    ]);
    const updated = await prisma.user.findUnique({
      where: { id },
      include: { clientProfile: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update client error:", e);
    return apiError("Failed to update client.", 500);
  }
}
