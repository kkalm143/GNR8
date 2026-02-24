import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/api-helpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-helpers")>();
  return {
    ...actual,
    requireAdmin: vi.fn(),
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

const requireAdmin = (await import("@/lib/api-helpers")).requireAdmin;
const prisma = (await import("@/lib/db")).prisma;
const { validatePassword, updateUserPassword } = await import("@/lib/password");

describe("PATCH /api/admin/users/[id]/password", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(validatePassword).mockReturnValue({ ok: true });
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      require("next/server").NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const req = new Request("http://localhost/api/admin/users/u1/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: "newpass123" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "u1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when user not found", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/users/u1/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: "newpass123" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "u1" }) });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("User not found");
  });

  it("returns 400 when new password is invalid", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u1",
      email: "u@test.com",
    } as any);
    vi.mocked(validatePassword).mockReturnValue({
      ok: false,
      error: "Password must be at least 8 characters.",
    });
    const req = new Request("http://localhost/api/admin/users/u1/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: "short" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "u1" }) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("8 characters");
  });

  it("returns 200 and updates password when valid", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u1",
      email: "u@test.com",
    } as any);
    const req = new Request("http://localhost/api/admin/users/u1/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: "newpass123" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "u1" }) });
    expect(res.status).toBe(200);
    expect(updateUserPassword).toHaveBeenCalledWith(
      expect.anything(),
      "u1",
      "newpass123"
    );
  });
});
