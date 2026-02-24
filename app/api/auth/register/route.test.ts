import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  hash: vi.fn().mockResolvedValue("hashed"),
}));

const prisma = (await import("@/lib/db")).prisma;

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(prisma.user.create).mockReset();
  });

  it("returns 400 when email is missing", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "password123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Email and password");
  });

  it("returns 400 when password is missing", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "u@test.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Email and password");
  });

  it("returns 400 when password is shorter than 8 characters", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "u@test.com", password: "short" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("at least 8");
  });

  it("returns 409 when email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing",
      email: "existing@test.com",
      name: null,
      passwordHash: "x",
      role: "client",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "existing@test.com", password: "password123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("already exists");
  });

  it("returns 200 and { ok: true } when registration succeeds", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-user",
      email: "new@test.com",
      name: null,
      passwordHash: "hashed",
      role: "client",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "new@test.com", password: "password123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "new@test.com",
          role: "client",
        }),
      })
    );
  });

  it("accepts optional name and passes it to create", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({} as any);
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "named@test.com",
        password: "password123",
        name: "Test User",
      }),
    });
    await POST(req);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "named@test.com",
          name: "Test User",
        }),
      })
    );
  });
});
