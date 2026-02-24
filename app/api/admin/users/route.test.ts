import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

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
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock("@/lib/user-create", () => ({
  createUserWithRole: vi.fn(),
}));

const requireAdmin = (await import("@/lib/api-helpers")).requireAdmin;
const prisma = (await import("@/lib/db")).prisma;
const { createUserWithRole } = await import("@/lib/user-create");

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockReset();
    vi.mocked(prisma.user.findMany).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      require("next/server").NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const req = new Request("http://localhost/api/admin/users");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with user list when admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: "u1",
        email: "user@test.com",
        name: "User",
        role: "client",
        createdAt: new Date(),
        archivedAt: null,
      },
    ] as any);
    const req = new Request("http://localhost/api/admin/users");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].email).toBe("user@test.com");
    expect(data[0].role).toBe("client");
  });

  it("filters by role when role=admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    await GET(new Request("http://localhost/api/admin/users?role=admin"));
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { role: "admin" },
      })
    );
  });
});

describe("POST /api/admin/users", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(createUserWithRole).mockReset();
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      require("next/server").NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "new@test.com", role: "client" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when email missing", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "client" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Email");
  });

  it("returns 409 when email already exists", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u1",
      email: "existing@test.com",
    } as any);
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "existing@test.com", role: "client" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("already exists");
  });

  it("creates user with role admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(createUserWithRole).mockResolvedValue({
      id: "u1",
      email: "admin2@test.com",
      name: "Admin 2",
      role: "admin",
    } as any);
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin2@test.com",
        name: "Admin 2",
        password: "adminpass123",
        role: "admin",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(createUserWithRole).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        email: "admin2@test.com",
        name: "Admin 2",
        role: "admin",
      })
    );
  });

  it("creates user with role client", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(createUserWithRole).mockResolvedValue({
      id: "u2",
      email: "client@test.com",
      name: "Client",
      role: "client",
      clientProfile: {},
    } as any);
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "client@test.com",
        name: "Client",
        role: "client",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(createUserWithRole).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        email: "client@test.com",
        role: "client",
      })
    );
  });
});
