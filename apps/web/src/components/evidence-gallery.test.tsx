import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { FieldEvidenceSnapshot } from "@egog/shared";

import { EvidenceGallery } from "./evidence-gallery";

vi.mock("next/image", () => ({
  default: ({ alt }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt} />
  ),
}));

const media: FieldEvidenceSnapshot["media"] = Array.from({ length: 4 }, (_, index) => ({
  id: `field-evidence-${index + 1}`,
  category: "field",
  title: `Field evidence ${index + 1}`,
  description: `Field evidence description ${index + 1}`,
  contentType: "image/jpeg",
  sha256: String(index + 1).repeat(64),
  capturedAt: "2026-07-27T01:19:41.000Z",
  timestampBasis: "exif",
  observationPeriod: null,
  ipfsUri: `ipfs://bafyevidence${index + 1}`,
  gatewayUrl: `https://gateway.example/ipfs/bafyevidence${index + 1}`,
  s3BackupKey: `field-evidence/jeju/v1/${index + 1}.jpg`,
}));

describe("EvidenceGallery", () => {
  afterEach(cleanup);

  it("opens evidence in a keyboard-accessible dialog and restores trigger focus", async () => {
    const user = userEvent.setup();
    render(
      <EvidenceGallery
        description="Original field evidence."
        media={media}
        title="Field Gallery"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Open Field evidence 1" });
    expect(screen.getAllByRole("button", { name: /^Open Field evidence/ })).toHaveLength(4);

    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Field evidence 1" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /View public IPFS file/ }).getAttribute("href"))
      .toBe("https://gateway.example/ipfs/bafyevidence1");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Field evidence 1" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
