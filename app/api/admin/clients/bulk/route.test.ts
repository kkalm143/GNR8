import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock("bcrypt", () => ({ hash: vi.fn().mockResolvedValue("hashed") }));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("POST /api/admin/clients/bulk", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockImplementation((args: { data: { email: string } }) =>
      Promise.resolve({
        id: "new-" + args.data.email,
        email: args.data.email,
        name: null,
        passwordHash: "hashed",
        role: "client",
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        clientProfile: { id: "cp1", userId: "new-" + args.data.email, phone: null, timezone: null, dateOfBirth: null, consultationFileUrl: null, createdAt: new Date(), updatedAt: new Date() },
      } as any)
    );
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: [{ email: "a@test.com" }, { email: "b@test.com" }] }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when clients not array or wrong size", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    let res = await POST(
      new Request("http://localhost/api/admin/clients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
    res = await POST(
      new Request("http://localhost/api/admin/clients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: [{ email: "only@one.com" }] }),
      })
    );
    expect(res.status).toBe(400);
    res = await POST(
      new Request("http://localhost/api/admin/clients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: Array(10).fill({ email: "x@test.com" }) }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 with created clients (2-8)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clients: [
            { email: "bulk1@test.com", name: "Bulk 1" },
            { email: "bulk2@test.com", name: "Bulk 2" },
          ],
        }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.created)).toBe(true);
    expect(data.created.length).toBe(2);
    expect(data.created[0].email).toBe("bulk1@test.com");
    expect(data.created[1].email).toBe("bulk2@test.com");
  });
});
