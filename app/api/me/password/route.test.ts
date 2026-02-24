import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { PATCH } from "./route";

const mockCompare = vi.fn();
vi.mock("bcrypt", () => ({
  compare: (a: string, b: string) => mockCompare(a, b),
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/api-helpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-helpers")>();
  return {
    ...actual,
    requireAuth: vi.fn(),
  };
});
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/password", () => ({
  validatePassword: vi.fn(),
  updateUserPassword: vi.fn().mockResolvedValue(undefined),
}));

const requireAuth = (await import("@/lib/api-helpers")).requireAuth;
const prisma = (await import("@/lib/db")).prisma;
const { validatePassword, updateUserPassword } = await import("@/lib/password");

describe("PATCH /api/me/password", () => {
  beforeEach(() => {
    mockCompare.mockReset();
    vi.mocked(requireAuth).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(validatePassword).mockReturnValue({ ok: true });
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const req = new Request("http://localhost/api/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: "oldpass123",
        newPassword: "newpass123",
      }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when current password is incorrect", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", email: "u@test.com", role: "client" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u1",
      passwordHash: "hashed",
    } as any);
    mockCompare.mockResolvedValue(false);
    const req = new Request("http://localhost/api/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: "wrong",
        newPassword: "newpass123",
      }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Current password");
  });

  it("returns 400 when new password is too short", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", email: "u@test.com", role: "client" },
    } as any);
    vi.mocked(validatePassword).mockReturnValue({
      ok: false,
      error: "Password must be at least 8 characters.",
    });
    const req = new Request("http://localhost/api/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: "oldpass123",
        newPassword: "short",
      }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("8 characters");
  });

  it("returns 200 and updates password when valid", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", email: "u@test.com", role: "client" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u1",
      passwordHash: "hashed",
    } as any);
    mockCompare.mockResolvedValue(true);
    const req = new Request("http://localhost/api/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: "oldpass123",
        newPassword: "newpass123",
      }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    expect(updateUserPassword).toHaveBeenCalledWith(
      expect.anything(),
      "u1",
      "newpass123"
    );
  });
});
