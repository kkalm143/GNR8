import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: { task: { findMany: vi.fn() } },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("GET /api/tasks", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.task.findMany).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/tasks"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await GET(new Request("http://localhost/api/tasks"));
    expect(res.status).toBe(403);
  });

  it("returns 200 with tasks for authenticated client", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    const tasks = [{ id: "t1", title: "Check form", dueDate: new Date(), completedAt: null }];
    vi.mocked(prisma.task.findMany).mockResolvedValue(tasks as any);
    const res = await GET(new Request("http://localhost/api/tasks"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { assignedToUserId: "c1" } })
    );
  });
});
