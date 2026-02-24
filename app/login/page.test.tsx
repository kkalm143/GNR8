/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "./page";

vi.mock("./login-form", () => ({
  LoginForm: () => <div data-testid="login-form">LoginForm</div>,
}));

describe("LoginPage", () => {
  it("shows Log in as admin and Log in as client links when no mode", async () => {
    const Page = await LoginPage({
      searchParams: Promise.resolve({}),
    });
    render(Page);
    expect(
      screen.getByRole("link", { name: /log in as admin/i })
    ).toHaveAttribute("href", "/login?mode=admin");
    expect(
      screen.getByRole("link", { name: /log in as client/i })
    ).toHaveAttribute("href", "/login?mode=client");
  });

  it("shows contextual heading when mode=admin", async () => {
    const Page = await LoginPage({
      searchParams: Promise.resolve({ mode: "admin" }),
    });
    render(Page);
    expect(
      screen.getByRole("heading", { name: /log in to admin dashboard/i })
    ).toBeInTheDocument();
  });

  it("shows contextual heading when mode=client", async () => {
    const Page = await LoginPage({
      searchParams: Promise.resolve({ mode: "client" }),
    });
    render(Page);
    expect(
      screen.getByRole("heading", { name: /log in to client app/i })
    ).toBeInTheDocument();
  });
});
