import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    task: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("PATCH /api/tasks/[id]/complete", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.task.findFirst).mockReset();
    vi.mocked(prisma.task.update).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await PATCH(new Request("http://localhost/api/tasks/t1/complete"), {
      params: Promise.resolve({ id: "t1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when task not found or not assigned to user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    vi.mocked(prisma.task.findFirst).mockResolvedValue(null);
    const res = await PATCH(new Request("http://localhost/api/tasks/t1/complete"), {
      params: Promise.resolve({ id: "t1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 200 and sets completedAt when client is assignee", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    vi.mocked(prisma.task.findFirst).mockResolvedValue({ id: "t1", assignedToUserId: "c1" } as any);
    vi.mocked(prisma.task.update).mockResolvedValue({
      id: "t1",
      completedAt: new Date(),
    } as any);
    const res = await PATCH(new Request("http://localhost/api/tasks/t1/complete"), {
      params: Promise.resolve({ id: "t1" }),
    });
    expect(res.status).toBe(200);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: { completedAt: expect.any(Date) },
    });
  });
});
