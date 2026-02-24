import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { clientProfile: true },
  });
  if (!user) return apiError("User not found.", 404);
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    clientProfile: user.clientProfile
      ? {
          phone: user.clientProfile.phone,
          timezone: user.clientProfile.timezone,
          dateOfBirth: user.clientProfile.dateOfBirth?.toISOString().slice(0, 10) ?? "",
          onboardingCompletedAt: user.clientProfile.onboardingCompletedAt?.toISOString() ?? null,
        }
      : null,
  });
}

export async function PATCH(request: Request) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { clientProfile: true },
  });
  if (!user) return apiError("User not found.", 404);
  try {
    const body = await request.json();
    const { name, phone, timezone, dateOfBirth } = body;
    const profileId = user.clientProfile?.id;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(typeof name === "string" && { name: name || null }),
        },
      }),
      profileId
        ? prisma.clientProfile.update({
            where: { id: profileId },
            data: {
              ...(typeof phone === "string" && { phone: phone || null }),
              ...(typeof timezone === "string" && { timezone: timezone || null }),
              ...(dateOfBirth !== undefined && {
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              }),
            },
          })
        : prisma.clientProfile.create({
            data: {
              userId,
              phone: typeof phone === "string" ? phone || null : null,
              timezone: typeof timezone === "string" ? timezone || null : null,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            },
          }),
    ]);
    const updated = await prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update profile error:", e);
    return apiError("Failed to update profile.", 500);
  }
}
