import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const user = await prisma.user.findFirst({
    where: { id, role: "client" },
    include: { clientProfile: true, dnaResults: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const user = await prisma.user.findFirst({
    where: { id, role: "client" },
    include: { clientProfile: true },
  });
  if (!user) return NextResponse.json({ error: "Client not found." }, { status: 404 });
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
    return NextResponse.json({ error: "Failed to update client." }, { status: 500 });
  }
}
