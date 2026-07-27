import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  forwardRef,
  type AnchorHTMLAttributes,
} from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppLink } from "./app-link";

const linkStatus = vi.hoisted(() => ({
  pending: false,
}));

vi.mock("next/link", () => ({
  default: forwardRef<
    HTMLAnchorElement,
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
      prefetch?: boolean;
    }
  >(function MockLink({ children, href, prefetch, ...props }, ref) {
    void prefetch;
    return (
      <a {...props} href={href} ref={ref}>
        {children}
      </a>
    );
  }),
  useLinkStatus: () => ({ pending: linkStatus.pending }),
}));

describe("AppLink", () => {
  afterEach(() => {
    cleanup();
    linkStatus.pending = false;
    vi.clearAllMocks();
  });

  it("keeps internal link semantics without a pending announcement", () => {
    render(<AppLink href="/projects/jeju-erw">View project</AppLink>);

    const link = screen.getByRole("link", { name: "View project" });
    expect(link.getAttribute("href")).toBe("/projects/jeju-erw");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("announces and draws navigation feedback while pending", () => {
    linkStatus.pending = true;
    render(<AppLink href="/me">My Participation</AppLink>);

    expect(screen.getByRole("link", { name: "My Participation" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Loading page");
    expect(document.querySelector(".route-progress-indicator")).toBeTruthy();
  });

  it("preserves modifier click and new-tab attributes", () => {
    const onClick = vi.fn();
    render(
      <AppLink href="/privacy" onClick={onClick} target="_blank">
        Privacy
      </AppLink>,
    );
    const link = screen.getByRole("link", { name: "Privacy" });

    fireEvent.click(link, { metaKey: true });

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(link.getAttribute("target")).toBe("_blank");
  });
});
