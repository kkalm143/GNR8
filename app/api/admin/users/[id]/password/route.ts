import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { validatePassword, updateUserPassword } from "@/lib/password";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: userId } = await context.params;
  try {
    const body = await request.json();
    const newPassword = body.newPassword;
    if (typeof newPassword !== "string") {
      return apiError("New password is required.", 400);
    }
    const validation = validatePassword(newPassword);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return apiError("User not found.", 404);
    }
    await updateUserPassword(prisma, userId, newPassword);
    return NextResponse.json({});
  } catch (e) {
    return apiError("Failed to update password.", 500, e);
  }
}
