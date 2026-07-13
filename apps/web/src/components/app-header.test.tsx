import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppHeader } from "./app-header";

const privyMocks = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: true,
    login: privyMocks.login,
    logout: privyMocks.logout,
    ready: true,
  }),
  useWallets: () => ({
    wallets: [
      {
        address: "0x1234567890123456789012345678901234567890",
        walletClientType: "privy",
      },
    ],
  }),
}));

describe("AppHeader account menu", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("opens the account menu without signing the user out", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);

    await user.click(screen.getByRole("button"));

    expect(privyMocks.logout).not.toHaveBeenCalled();
    expect(screen.getByText("Wallet address")).toBeTruthy();
  });

  it("signs out only from the explicit Sign out menu item", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    await user.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(privyMocks.logout).toHaveBeenCalledTimes(1);
  });

  it("exposes the account navigation destinations as menu items", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);

    await user.click(screen.getByRole("button", { name: /account menu/i }));

    expect(screen.getByRole("menuitem", { name: "My Participation" }).getAttribute("href")).toBe("/me");
    expect(screen.getByRole("menuitem", { name: "Privacy" }).getAttribute("href")).toBe("/privacy");
    expect(screen.getByRole("menuitem", { name: "Terms" }).getAttribute("href")).toBe("/terms");
  });

  it("does not expose account deletion in the account menu", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);

    await user.click(screen.getByRole("button", { name: /account menu/i }));

    expect(screen.queryByRole("menuitem", { name: "Delete Account" })).toBeNull();
  });

  it("closes on Escape and returns focus to the account trigger", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);
    const trigger = screen.getByRole("button", { name: /account menu/i });

    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeTruthy();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(privyMocks.logout).not.toHaveBeenCalled();
  });

  it("closes on an outside pointer interaction without changing the session", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <AppHeader />
        <button type="button">Outside control</button>
      </div>,
    );
    const outsideControl = screen.getByRole("button", { name: "Outside control" });

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    fireEvent.pointerDown(outsideControl);

    expect(screen.queryByRole("menu")).toBeNull();
    expect(privyMocks.logout).not.toHaveBeenCalled();
  });

  it("supports keyboard arrow navigation and activation", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);
    const trigger = screen.getByRole("button", { name: /account menu/i });
    trigger.focus();

    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");

    expect(privyMocks.logout).toHaveBeenCalledTimes(1);
  });

  it("closes when the account trigger is activated again", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);
    const trigger = screen.getByRole("button", { name: /account menu/i });

    await user.click(trigger);
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(privyMocks.logout).not.toHaveBeenCalled();
  });

  it("closes on Tab, advances focus, and keeps the user signed in", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <AppHeader />
        <button type="button">After header</button>
      </div>,
    );
    const trigger = screen.getByRole("button", { name: /account menu/i });
    trigger.focus();

    await user.keyboard("{ArrowDown}");
    await user.tab();

    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After header" }));
    expect(privyMocks.logout).not.toHaveBeenCalled();
  });

  it("closes on Shift+Tab and returns focus to the previous page control", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);
    const trigger = screen.getByRole("button", { name: /account menu/i });
    trigger.focus();

    await user.keyboard("{ArrowDown}");
    await user.tab({ shift: true });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "My participation" }));
    expect(privyMocks.logout).not.toHaveBeenCalled();
  });

});
