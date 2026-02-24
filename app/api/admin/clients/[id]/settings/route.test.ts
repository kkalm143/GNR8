import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    clientSettings: { findFirst: vi.fn(), upsert: vi.fn() },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

const clientProfileId = "cp1";
const clientUser = {
  id: "c1",
  role: "client",
  clientProfile: { id: clientProfileId, userId: "c1" },
};

describe("GET /api/admin/clients/[id]/settings", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(clientUser as any);
    vi.mocked(prisma.clientSettings.findFirst).mockResolvedValue({
      id: "cs1",
      clientProfileId,
      workoutComments: true,
      workoutVisibility: true,
      allowRearrange: false,
      replaceExercise: false,
      allowCreateWorkouts: false,
      pinnedMetrics: null,
    } as any);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/clients/c1/settings"), { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when client not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/clients/c1/settings"), { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 with settings when found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await GET(new Request("http://localhost/api/admin/clients/c1/settings"), { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.workoutComments).toBe(true);
    expect(data.workoutVisibility).toBe(true);
  });
});

describe("PATCH /api/admin/clients/[id]/settings", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findFirst).mockResolvedValue(clientUser as any);
    vi.mocked(prisma.clientSettings.upsert).mockResolvedValue({
      id: "cs1",
      clientProfileId,
      workoutComments: false,
      workoutVisibility: true,
      allowRearrange: true,
      replaceExercise: false,
      allowCreateWorkouts: false,
      pinnedMetrics: ["body_metric:weight"],
    } as any);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await PATCH(
      new Request("http://localhost/api/admin/clients/c1/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with updated settings", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await PATCH(
      new Request("http://localhost/api/admin/clients/c1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutComments: false, allowRearrange: true, pinnedMetrics: ["body_metric:weight"] }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.workoutComments).toBe(false);
    expect(data.allowRearrange).toBe(true);
  });
});
