import { describe, it, expect, vi, beforeEach } from "vitest";
import { validatePassword, hashPassword, updateUserPassword } from "./password";

describe("validatePassword", () => {
  it("returns ok: true for password with 8+ characters", () => {
    expect(validatePassword("password")).toEqual({ ok: true });
    expect(validatePassword("12345678")).toEqual({ ok: true });
    expect(validatePassword("longpassword123")).toEqual({ ok: true });
  });

  it("returns ok: false with error for password shorter than 8 characters", () => {
    const result = validatePassword("short");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("8 characters");
    }
  });

  it("returns ok: false for empty string", () => {
    const result = validatePassword("");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeDefined();
    }
  });
});

describe("hashPassword", () => {
  it("returns a different string from input", async () => {
    const hashed = await hashPassword("mypassword");
    expect(hashed).not.toBe("mypassword");
    expect(hashed.length).toBeGreaterThan(0);
  });

  it("returns different hashes for same input (salt)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});

describe("updateUserPassword", () => {
  const mockUpdate = vi.fn();
  const prisma = { user: { update: mockUpdate } } as any;

  beforeEach(() => {
    mockUpdate.mockReset();
    mockUpdate.mockResolvedValue(undefined);
  });

  it("calls prisma.user.update with hashed password", async () => {
    await updateUserPassword(prisma, "user-1", "newpassword123");
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        passwordHash: expect.any(String),
      },
    });
    const hash = mockUpdate.mock.calls[0][0].data.passwordHash;
    expect(hash).not.toBe("newpassword123");
    expect(hash.length).toBeGreaterThan(0);
  });
});
