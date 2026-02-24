import type { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "@/lib/password";

const DEFAULT_CLIENT_PASSWORD = "changeme123";

export interface CreateUserWithRoleData {
  email: string;
  name?: string | null;
  password?: string;
  role: Role;
  phone?: string | null;
  dateOfBirth?: Date | null;
  timezone?: string | null;
}

/**
 * Create a user with the given role. For role=client, also creates ClientProfile
 * and ClientSettings with the same defaults as the clients route.
 */
export async function createUserWithRole(
  prisma: PrismaClient,
  data: CreateUserWithRoleData
): Promise<{ id: string; email: string; name: string | null; role: Role; clientProfile?: unknown }> {
  const plainPassword =
    typeof data.password === "string" && data.password.length >= 8
      ? data.password
      : DEFAULT_CLIENT_PASSWORD;
  const passwordHash = await hashPassword(plainPassword);

  if (data.role === "admin") {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: typeof data.name === "string" ? data.name : null,
        passwordHash,
        role: "admin",
      },
    });
    return user;
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: typeof data.name === "string" ? data.name : null,
      passwordHash,
      role: "client",
      clientProfile: {
        create: {
          phone: typeof data.phone === "string" ? data.phone : null,
          timezone: typeof data.timezone === "string" ? data.timezone : null,
          dateOfBirth: data.dateOfBirth ?? null,
          clientSettings: {
            create: {
              workoutComments: true,
              workoutVisibility: true,
              allowRearrange: false,
              replaceExercise: false,
              allowCreateWorkouts: false,
            },
          },
        },
      },
    },
    include: { clientProfile: { include: { clientSettings: true } } },
  });
  return user;
}
