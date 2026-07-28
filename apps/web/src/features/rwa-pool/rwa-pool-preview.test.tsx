import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  forwardRef,
  type AnchorHTMLAttributes,
} from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RwaPoolPreview } from "./rwa-pool-preview";
import { getRwaPoolScenario } from "./scenarios";

const privyState = vi.hoisted(() => ({
  authenticated: false,
  getAccessToken: vi.fn().mockResolvedValue("token"),
  ready: true,
}));

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => privyState,
}));

vi.mock("next/link", () => ({
  default: forwardRef<
    HTMLAnchorElement,
    AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
  >(function MockLink({ children, href, ...props }, ref) {
    return <a {...props} href={href} ref={ref}>{children}</a>;
  }),
  useLinkStatus: () => ({ pending: false }),
}));

describe("RWA pool preview", () => {
  afterEach(() => {
    cleanup();
    privyState.authenticated = false;
    privyState.ready = true;
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows illustrative data and routes active minting to participation", async () => {
    render(<RwaPoolPreview scenario={getRwaPoolScenario("vietnam-brick")!} />);

    expect(screen.getByText("Preview scenario — not live market data")).toBeTruthy();
    expect(screen.queryByText("Illustrative scenario")).toBeNull();
    expect(screen.queryByText("GIWA Testnet")).toBeNull();
    expect(screen.getByText("wVB-USDC")).toBeTruthy();
    expect(screen.getByText("1.48M USDC")).toBeTruthy();
    expect(screen.getByText("8.4%")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Mint Early Participation NFT/ }).getAttribute("href"))
      .toBe("/participate/vietnam-brick");
    expect(screen.queryByRole("button", { name: /Deposit|Withdraw|Connect Wallet/i })).toBeNull();
  });

  it("changes chart metrics with pointer and arrow-key tab navigation", async () => {
    const user = userEvent.setup();
    render(<RwaPoolPreview scenario={getRwaPoolScenario("jeju-erw")!} />);

    const price = screen.getByRole("tab", { name: "Reference price" });
    const apy = screen.getByRole("tab", { name: "APY" });
    expect(price.getAttribute("aria-selected")).toBe("true");

    await user.click(apy);
    expect(apy.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("APY");

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Pool volume" }).getAttribute("aria-selected")).toBe("true");
  });

  it("shows y-axis labels and reveals a point value by pointer or keyboard focus", async () => {
    const user = userEvent.setup();
    render(<RwaPoolPreview scenario={getRwaPoolScenario("vietnam-brick")!} />);

    expect(screen.getAllByText("USDC / tCO₂e").length).toBeGreaterThan(0);
    const firstPoint = screen.getByRole("button", { name: /^Month 1:/ });
    await user.click(firstPoint);

    expect(screen.getByText("Month 1")).toBeTruthy();
    expect(firstPoint.getAttribute("tabindex")).toBe("0");
  });

  it("disables Solar minting while preserving its preview", () => {
    render(<RwaPoolPreview scenario={getRwaPoolScenario("solar-mobility")!} />);

    expect(screen.getByText("1.76M USDC")).toBeTruthy();
    expect(screen.getAllByText("wSM-USDC").length).toBeGreaterThan(0);
    expect((screen.getByRole("button", { name: "Minting coming soon" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole("link", { name: /Mint Early Participation NFT/ })).toBeNull();
  });

  it("shows the existing member and token when participation is already minted", async () => {
    privyState.authenticated = true;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        project: { slug: "jeju-erw" },
        participation: { memberNumber: "7", tokenId: "42" },
      }],
    }));

    render(<RwaPoolPreview scenario={getRwaPoolScenario("jeju-erw")!} />);

    expect(await screen.findByText("Early Participation NFT minted")).toBeTruthy();
    expect(screen.getByText("Member #7")).toBeTruthy();
    expect(screen.getByText("Token ID 42")).toBeTruthy();
    expect(screen.getByRole("link", { name: /View My Participation/ }).getAttribute("href")).toBe("/me");
    await waitFor(() => expect(privyState.getAccessToken).toHaveBeenCalledOnce());
  });
});
