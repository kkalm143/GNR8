import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    clientGroup: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("GET /api/admin/client-groups", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/client-groups"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with groups list when admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.clientGroup.findMany).mockResolvedValue([
      { id: "g1", name: "VIP", description: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any);
    const res = await GET(new Request("http://localhost/api/admin/client-groups"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].name).toBe("VIP");
  });
});

describe("POST /api/admin/client-groups", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/client-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "VIP" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/client-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.toLowerCase()).toContain("name");
  });

  it("returns 200 with created group when admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.clientGroup.create).mockResolvedValue({
      id: "g1",
      name: "VIP",
      description: "VIP clients",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/client-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "VIP", description: "VIP clients" }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("VIP");
    expect(data.description).toBe("VIP clients");
  });
});
