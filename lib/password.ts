import { hash } from "bcrypt";
import type { PrismaClient } from "@prisma/client";

const MIN_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

export function validatePassword(
  password: string
): { ok: true } | { ok: false; error: string } {
  if (password.length < MIN_LENGTH) {
    return {
      ok: false,
      error: "Password must be at least 8 characters.",
    };
  }
  return { ok: true };
}

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, BCRYPT_ROUNDS);
}

/**
 * Hash and update a user's password. Used by change-own-password and admin-reset.
 */
export async function updateUserPassword(
  prisma: PrismaClient,
  userId: string,
  newPlainPassword: string
): Promise<void> {
  const passwordHash = await hashPassword(newPlainPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
