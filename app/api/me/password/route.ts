import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import { requireAuth, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { validatePassword, updateUserPassword } from "@/lib/password";

export async function PATCH(request: Request) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await request.json();
    const currentPassword = body.currentPassword;
    const newPassword = body.newPassword;
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return apiError("Current password and new password are required.", 400);
    }
    const validation = validatePassword(newPassword);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return apiError("User not found.", 404);
    }
    const match = await compare(currentPassword, user.passwordHash);
    if (!match) {
      return apiError("Current password is incorrect.", 400);
    }
    await updateUserPassword(prisma, session.user.id, newPassword);
    return NextResponse.json({});
  } catch (e) {
    return apiError("Failed to update password.", 500, e);
  }
}
