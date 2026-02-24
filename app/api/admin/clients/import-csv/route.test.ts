import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock("bcrypt", () => ({ hash: vi.fn().mockResolvedValue("hashed") }));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("POST /api/admin/clients/import-csv", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockImplementation((args: { data: { email: string } }) =>
      Promise.resolve({
        id: "new-" + args.data.email,
        email: args.data.email,
        name: null,
        role: "client",
        clientProfile: {},
      } as any)
    );
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/import-csv", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: "email,name\nj@test.com,Jane",
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when body empty or not CSV-like", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    let res = await POST(
      new Request("http://localhost/api/admin/clients/import-csv", {
        method: "POST",
        body: "",
      })
    );
    expect(res.status).toBe(400);
    res = await POST(
      new Request("http://localhost/api/admin/clients/import-csv", {
        method: "POST",
        body: "no header row",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 with created and errors when CSV has email column", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const csv = "email,name,phone\njane@test.com,Jane,555-1234\nbob@test.com,Bob,";
    const res = await POST(
      new Request("http://localhost/api/admin/clients/import-csv", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: csv,
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.created)).toBe(true);
    expect(Array.isArray(data.errors)).toBe(true);
    expect(data.created.length).toBe(2);
  });

  it("rejects CSV without email column", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/import-csv", {
        method: "POST",
        body: "name,phone\nJane,555",
      })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.toLowerCase()).toContain("email");
  });
});
