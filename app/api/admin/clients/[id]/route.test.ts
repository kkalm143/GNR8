import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    clientProfile: { update: vi.fn(), create: vi.fn() },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

const clientUser = {
  id: "c1",
  email: "c@test.com",
  name: "Client",
  role: "client",
  archivedAt: null,
  clientProfile: { id: "cp1", userId: "c1", phone: null, timezone: null, dateOfBirth: null, consultationFileUrl: null, createdAt: new Date(), updatedAt: new Date() },
};

describe("GET /api/admin/clients/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findFirst).mockReset();
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/clients/c1");
    const res = await GET(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when client not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/clients/c1"), { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 with client when found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(clientUser as any);
    const res = await GET(new Request("http://localhost/api/admin/clients/c1"), { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("c1");
    expect(data.email).toBe("c@test.com");
  });
});

describe("PATCH /api/admin/clients/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findFirst).mockReset();
    vi.mocked(prisma.user.update).mockReset();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...clientUser } as any);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await PATCH(
      new Request("http://localhost/api/admin/clients/c1", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("archives client when archived: true", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(clientUser as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (ops: unknown[]) => {
      const updateCall = (ops as Array<() => unknown>).find((op: unknown) => typeof op === "function" || (typeof op === "object" && op !== null));
      if (Array.isArray(ops) && ops.length) {
        const first = ops[0];
        if (typeof first === "object" && first && "data" in first) {
          expect((first as { data: { archivedAt: Date | null } }).data.archivedAt).toBeInstanceOf(Date);
        }
      }
      return Promise.all(ops as Promise<unknown>[]);
    });
    const res = await PATCH(
      new Request("http://localhost/api/admin/clients/c1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "c1" },
        data: expect.objectContaining({ archivedAt: expect.any(Date) }),
      })
    );
  });

  it("reactivates client when archived: false", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ ...clientUser, archivedAt: new Date() } as any);
    const res = await PATCH(
      new Request("http://localhost/api/admin/clients/c1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "c1" },
        data: expect.objectContaining({ archivedAt: null }),
      })
    );
  });
});
