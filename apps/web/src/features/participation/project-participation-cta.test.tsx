import { cleanup, render, screen } from "@testing-library/react";
import {
  forwardRef,
  type AnchorHTMLAttributes,
} from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectParticipationCta } from "./project-participation-cta";

vi.mock("next/link", () => ({
  default: forwardRef<
    HTMLAnchorElement,
    AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
  >(function MockLink({ children, href, ...props }, ref) {
    return <a {...props} href={href} ref={ref}>{children}</a>;
  }),
  useLinkStatus: () => ({ pending: false }),
}));

describe("ProjectParticipationCta", () => {
  afterEach(cleanup);

  it("routes project detail into the RWA pool preview", () => {
    render(<ProjectParticipationCta projectSlug="jeju-erw" />);

    const link = screen.getByRole("link", { name: /Explore RWA DeFi Pool/ });
    expect(link.getAttribute("href")).toBe("/rwa-pools/jeju-erw");
  });
});
