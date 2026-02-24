import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH, DELETE } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    clientGroup: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("GET /api/admin/client-groups/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/client-groups/g1"), { params: Promise.resolve({ id: "g1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when group not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.clientGroup.findUnique).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/client-groups/g1"), { params: Promise.resolve({ id: "g1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 with group and users when found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.clientGroup.findUnique).mockResolvedValue({
      id: "g1",
      name: "VIP",
      description: null,
      users: [{ user: { id: "u1", name: "Jane", email: "j@test.com" } }],
    } as any);
    const res = await GET(new Request("http://localhost/api/admin/client-groups/g1"), { params: Promise.resolve({ id: "g1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("VIP");
  });
});

describe("PATCH /api/admin/client-groups/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.clientGroup.findUnique).mockResolvedValue({ id: "g1", name: "VIP", description: null } as any);
    vi.mocked(prisma.clientGroup.update).mockResolvedValue({ id: "g1", name: "VIP Updated", description: "Desc" } as any);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await PATCH(
      new Request("http://localhost/api/admin/client-groups/g1", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "VIP Updated" }) }),
      { params: Promise.resolve({ id: "g1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with updated group", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await PATCH(
      new Request("http://localhost/api/admin/client-groups/g1", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "VIP Updated", description: "Desc" }) }),
      { params: Promise.resolve({ id: "g1" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("VIP Updated");
  });
});

describe("DELETE /api/admin/client-groups/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost/api/admin/client-groups/g1"), { params: Promise.resolve({ id: "g1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 204 when group deleted", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.clientGroup.delete).mockResolvedValue({ id: "g1", name: "VIP", description: null, createdAt: new Date(), updatedAt: new Date() } as any);
    const res = await DELETE(new Request("http://localhost/api/admin/client-groups/g1"), { params: Promise.resolve({ id: "g1" }) });
    expect(res.status).toBe(204);
  });
});
