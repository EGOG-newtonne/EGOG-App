import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AccountSkeleton, RouteSkeleton } from "./route-skeleton";

describe("RouteSkeleton", () => {
  afterEach(cleanup);

  it.each([
    ["discovery", "Loading project discovery"],
    ["project", "Loading project details"],
    ["participation", "Loading participation"],
    ["legal", "Loading legal document"],
  ] as const)("renders the %s structure without fake values", (variant, label) => {
    render(<RouteSkeleton variant={variant} />);

    const container = screen.getByLabelText(label);
    expect(container.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("status").textContent).toContain(label);
    expect(container.textContent).not.toMatch(/0x|tCO₂e|Member|Snapshot v\d/i);
  });

  it("renders the account structure for both route and client loading", () => {
    const { rerender } = render(<RouteSkeleton variant="account" />);

    expect(screen.getByLabelText("Loading My Participation").getAttribute("aria-busy")).toBe("true");

    rerender(<AccountSkeleton />);
    expect(screen.getByLabelText("Loading My Participation").getAttribute("aria-busy")).toBe("true");
    expect(document.querySelector(".spinner-large")).toBeNull();
  });

  it("marks decorative skeleton geometry as hidden from assistive technology", () => {
    render(<RouteSkeleton variant="project" />);

    const container = screen.getByLabelText("Loading project details");
    expect(container.querySelector("[aria-hidden='true']")).toBeTruthy();
  });
});
