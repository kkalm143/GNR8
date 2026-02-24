/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegisterForm } from "./register-form";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    global.fetch = vi.fn();
  });

  it("renders name, email, password inputs and submit button", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("calls fetch /api/auth/register with name, email, password on submit", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }).closest("form")!);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "new@test.com",
          password: "password123",
        }),
      });
    });
  });

  it("shows error when fetch returns not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "An account with this email already exists." }),
    } as Response);
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "existing@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }).closest("form")!);
    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it("calls router.push /login on successful registration", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }).closest("form")!);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
