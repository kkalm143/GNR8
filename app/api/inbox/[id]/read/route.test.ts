import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    message: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("PATCH /api/inbox/[id]/read", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.message.findFirst).mockReset();
    vi.mocked(prisma.message.update).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await PATCH(new Request("http://localhost/api/inbox/m1/read"), {
      params: Promise.resolve({ id: "m1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await PATCH(new Request("http://localhost/api/inbox/m1/read"), {
      params: Promise.resolve({ id: "m1" }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 when message not found or not recipient", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    vi.mocked(prisma.message.findFirst).mockResolvedValue(null);
    const res = await PATCH(new Request("http://localhost/api/inbox/m1/read"), {
      params: Promise.resolve({ id: "m1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 200 and updates readAt when client is recipient", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    vi.mocked(prisma.message.findFirst).mockResolvedValue({ id: "m1", recipientId: "c1" } as any);
    vi.mocked(prisma.message.update).mockResolvedValue({
      id: "m1",
      readAt: new Date(),
    } as any);
    const res = await PATCH(new Request("http://localhost/api/inbox/m1/read"), {
      params: Promise.resolve({ id: "m1" }),
    });
    expect(res.status).toBe(200);
    expect(prisma.message.update).toHaveBeenCalledWith({
      where: { id: "m1" },
      data: { readAt: expect.any(Date) },
    });
  });
});
