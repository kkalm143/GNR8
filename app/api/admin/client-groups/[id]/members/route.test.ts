import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, DELETE } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    clientGroup: { findUnique: vi.fn() },
    user: { findFirst: vi.fn() },
    userClientGroup: { create: vi.fn(), delete: vi.fn(), findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("POST /api/admin/client-groups/[id]/members", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.clientGroup.findUnique).mockResolvedValue({ id: "g1", name: "VIP" } as any);
    vi.mocked(prisma.user.findFirst).mockImplementation((args: { where: { id: string } }) =>
      Promise.resolve(args.where.id === "u1" || args.where.id === "u2" ? ({ id: args.where.id, role: "client" } as any) : null)
    );
    vi.mocked(prisma.userClientGroup.upsert).mockResolvedValue({ userId: "u1", groupId: "g1", createdAt: new Date() } as any);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/client-groups/g1/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: ["u1"] }),
      }),
      { params: Promise.resolve({ id: "g1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when userIds missing or not array", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/client-groups/g1/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "g1" }) }
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 and adds members", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/client-groups/g1/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: ["u1", "u2"] }),
      }),
      { params: Promise.resolve({ id: "g1" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.added).toBeDefined();
    expect(Array.isArray(data.added)).toBe(true);
  });
});

describe("DELETE /api/admin/client-groups/[id]/members", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.clientGroup.findUnique).mockResolvedValue({ id: "g1" } as any);
    vi.mocked(prisma.userClientGroup.delete).mockResolvedValue({ userId: "u1", groupId: "g1", createdAt: new Date() } as any);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost/api/admin/client-groups/g1/members?userId=u1"), { params: Promise.resolve({ id: "g1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 when userId missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await DELETE(new Request("http://localhost/api/admin/client-groups/g1/members"), { params: Promise.resolve({ id: "g1" }) });
    expect(res.status).toBe(400);
  });

  it("returns 200 when member removed", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await DELETE(new Request("http://localhost/api/admin/client-groups/g1/members?userId=u1"), { params: Promise.resolve({ id: "g1" }) });
    expect(res.status).toBe(200);
  });
});
