/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./login-form";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (provider: string, options: { email: string; password: string; redirect: boolean }) =>
    mockSignIn(provider, options),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockSignIn.mockClear();
  });

  it("renders email and password inputs and submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("calls signIn with credentials on submit", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "u@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }).closest("form")!);
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "u@test.com",
        password: "password123",
        redirect: false,
      });
    });
  });

  it("shows error when signIn returns error", async () => {
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin" });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "u@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }).closest("form")!);
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("calls router.push and refresh on successful login", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "u@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }).closest("form")!);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
