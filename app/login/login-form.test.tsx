/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./login-form";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
let searchParamsString = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(searchParamsString),
}));

const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (provider: string, options: { email: string; password: string; redirect: boolean }) =>
    mockSignIn(provider, options),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("LoginForm", () => {
  beforeEach(() => {
    searchParamsString = "";
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockSignIn.mockClear();
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({ ok: true });
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

  it("calls router.push /dashboard and refresh on successful login when no mode", async () => {
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

  it("redirects to /admin on successful login when mode=admin", async () => {
    searchParamsString = "mode=admin";
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "u@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }).closest("form")!);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
      expect(mockRefresh).toHaveBeenCalled();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls fetch view-as-client then push /dashboard on successful login when mode=client", async () => {
    searchParamsString = "mode=client";
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "u@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }).closest("form")!);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/view-as-client", {
        credentials: "include",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("redirects to callbackUrl on successful login when callbackUrl is present", async () => {
    searchParamsString = "callbackUrl=%2Fadmin%2Fclients";
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "u@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }).closest("form")!);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/clients");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
