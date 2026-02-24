/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClientNav } from "./client-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
}));
vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("ClientNav", () => {
  it("renders Today, Programs, Progress, Tasks, Inbox, Coaching, You, Results, and Log out", () => {
    render(<ClientNav />);
    expect(screen.getByRole("link", { name: /today/i })).toHaveAttribute("href", "/today");
    expect(screen.getByRole("link", { name: /programs/i })).toHaveAttribute("href", "/programs");
    expect(screen.getByRole("link", { name: /progress/i })).toHaveAttribute("href", "/progress");
    expect(screen.getByRole("link", { name: /tasks/i })).toHaveAttribute("href", "/tasks");
    expect(screen.getByRole("link", { name: /inbox/i })).toHaveAttribute("href", "/inbox");
    expect(screen.getByRole("link", { name: /coaching/i })).toHaveAttribute("href", "/coaching");
    expect(screen.getByRole("link", { name: /^you$/i })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("link", { name: /results/i })).toHaveAttribute("href", "/results");
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });
});
