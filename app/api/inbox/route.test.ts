import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    message: {
      findMany: vi.fn(),
    },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("GET /api/inbox", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.message.findMany).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/inbox"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is admin (inbox is for clients)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await GET(new Request("http://localhost/api/inbox"));
    expect(res.status).toBe(403);
  });

  it("returns 200 with messages for authenticated client", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    const messages = [
      {
        id: "m1",
        subject: "Welcome",
        body: "Hi there",
        readAt: null,
        createdAt: new Date(),
        sender: { id: "a1", name: "Coach" },
      },
    ];
    vi.mocked(prisma.message.findMany).mockResolvedValue(messages as any);
    const res = await GET(new Request("http://localhost/api/inbox"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0].subject).toBe("Welcome");
    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { recipientId: "c1" },
        orderBy: { createdAt: "desc" },
      })
    );
  });
});
