import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    message: {
      findFirst: vi.fn(),
    },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("GET /api/inbox/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.message.findFirst).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/inbox/m1"), {
      params: Promise.resolve({ id: "m1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await GET(new Request("http://localhost/api/inbox/m1"), {
      params: Promise.resolve({ id: "m1" }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 when message not found or not recipient", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    vi.mocked(prisma.message.findFirst).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/inbox/m1"), {
      params: Promise.resolve({ id: "m1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 200 with message when client is recipient", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    const msg = {
      id: "m1",
      subject: "Update",
      body: "Check your program.",
      readAt: null,
      createdAt: new Date(),
      sender: { id: "a1", name: "Coach" },
    };
    vi.mocked(prisma.message.findFirst).mockResolvedValue(msg as any);
    const res = await GET(new Request("http://localhost/api/inbox/m1"), {
      params: Promise.resolve({ id: "m1" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("m1");
    expect(data.subject).toBe("Update");
  });
});
