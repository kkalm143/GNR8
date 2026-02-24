import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUserWithRole } from "./user-create";

vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed"),
}));

const mockCreate = vi.fn();
const prisma = {
  user: {
    create: mockCreate,
  },
} as any;

describe("createUserWithRole", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("creates admin user without ClientProfile", async () => {
    mockCreate.mockResolvedValue({
      id: "u1",
      email: "admin@test.com",
      name: "Admin",
      role: "admin",
    });
    const result = await createUserWithRole(prisma, {
      email: "admin@test.com",
      name: "Admin",
      password: "adminpass123",
      role: "admin",
    });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        email: "admin@test.com",
        name: "Admin",
        passwordHash: "hashed",
        role: "admin",
      },
    });
    expect(result.role).toBe("admin");
    expect(result.email).toBe("admin@test.com");
  });

  it("creates client user with ClientProfile and ClientSettings", async () => {
    mockCreate.mockResolvedValue({
      id: "u2",
      email: "client@test.com",
      name: "Client",
      role: "client",
      clientProfile: { id: "cp1", clientSettings: {} },
    });
    await createUserWithRole(prisma, {
      email: "client@test.com",
      name: "Client",
      password: "clientpass123",
      role: "client",
      phone: "555-1234",
      timezone: "America/New_York",
    });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const call = mockCreate.mock.calls[0][0];
    expect(call.data.email).toBe("client@test.com");
    expect(call.data.role).toBe("client");
    expect(call.data.clientProfile).toBeDefined();
    expect(call.data.clientProfile.create).toBeDefined();
    expect(call.data.clientProfile.create.clientSettings.create).toEqual({
      workoutComments: true,
      workoutVisibility: true,
      allowRearrange: false,
      replaceExercise: false,
      allowCreateWorkouts: false,
    });
  });

  it("uses default password when not provided or too short (client)", async () => {
    const { hashPassword } = await import("@/lib/password");
    vi.mocked(hashPassword).mockResolvedValue("defaultHashed");
    mockCreate.mockResolvedValue({
      id: "u3",
      email: "nopass@test.com",
      name: null,
      role: "client",
      clientProfile: {},
    });
    await createUserWithRole(prisma, {
      email: "nopass@test.com",
      role: "client",
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: "defaultHashed",
        }),
      })
    );
  });
});
