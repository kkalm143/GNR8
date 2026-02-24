import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  hash: vi.fn().mockResolvedValue("hashed"),
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("GET /api/admin/clients", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/clients");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", email: "c@test.com", role: "client" },
    } as any);
    const req = new Request("http://localhost/api/admin/clients");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with client list when admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: "c1",
        email: "client@test.com",
        name: "Client",
        passwordHash: "x",
        role: "client",
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        clientProfile: null,
      },
    ] as any);
    const req = new Request("http://localhost/api/admin/clients");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].email).toBe("client@test.com");
  });

  it("excludes archived clients by default", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const findMany = vi.mocked(prisma.user.findMany);
    findMany.mockResolvedValue([]);
    await GET(new Request("http://localhost/api/admin/clients"));
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ archivedAt: null }),
      })
    );
  });

  it("includes archived when archived=true", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const findMany = vi.mocked(prisma.user.findMany);
    findMany.mockResolvedValue([]);
    await GET(new Request("http://localhost/api/admin/clients?archived=true"));
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          archivedAt: { not: null },
        }),
      })
    );
  });

  it("filters by search query (name/email)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const findMany = vi.mocked(prisma.user.findMany);
    findMany.mockResolvedValue([]);
    await GET(new Request("http://localhost/api/admin/clients?search=J"));
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: "J", mode: "insensitive" } },
            { email: { contains: "J", mode: "insensitive" } },
          ],
        }),
      })
    );
  });

  it("filters by groupId when provided", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const findMany = vi.mocked(prisma.user.findMany);
    findMany.mockResolvedValue([]);
    await GET(new Request("http://localhost/api/admin/clients?groupId=grp1"));
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          clientGroups: { some: { groupId: "grp1" } },
        }),
      })
    );
  });
});

describe("POST /api/admin/clients", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "new@test.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when email is missing", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", role: "admin" },
    } as any);
    const req = new Request("http://localhost/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Email");
  });

  it("returns 409 when email already exists", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing",
      email: "existing@test.com",
    } as any);
    const req = new Request("http://localhost/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "existing@test.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("already exists");
  });

  it("returns 200 with created user when admin and email is new", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", role: "admin" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const created = {
      id: "new-id",
      email: "newclient@test.com",
      name: "New Client",
      passwordHash: "hashed",
      role: "client",
      createdAt: new Date(),
      updatedAt: new Date(),
      clientProfile: { id: "cp1", userId: "new-id", phone: null, timezone: null, dateOfBirth: null, createdAt: new Date(), updatedAt: new Date() },
    };
    vi.mocked(prisma.user.create).mockResolvedValue(created as any);
    const req = new Request("http://localhost/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "newclient@test.com", name: "New Client" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.email).toBe("newclient@test.com");
    expect(data.clientProfile).toBeDefined();
  });
});
