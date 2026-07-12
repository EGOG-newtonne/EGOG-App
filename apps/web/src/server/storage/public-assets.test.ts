import { describe, expect, it, vi } from "vitest";

import { publishPublicAsset } from "./public-assets";

const asset = {
  bytes: new TextEncoder().encode('{"ok":true}'),
  name: "snapshot-v3.json",
  contentType: "application/json",
  backupKey: "public-snapshots/vietnam-brick/v3.json",
};

describe("publishPublicAsset", () => {
  it("publishes to public IPFS and private S3 with distinct references", async () => {
    const uploadPublic = vi.fn().mockResolvedValue({ cid: "bafy-test-cid" });
    const putBackup = vi.fn().mockResolvedValue(undefined);

    const result = await publishPublicAsset(asset, {
      uploadPublic,
      putBackup,
      gatewayBaseUrl: "https://gateway.pinata.cloud/ipfs",
    });

    expect(uploadPublic).toHaveBeenCalledWith(asset);
    expect(putBackup).toHaveBeenCalledWith(asset);
    expect(result).toEqual({
      cid: "bafy-test-cid",
      ipfsUri: "ipfs://bafy-test-cid",
      gatewayUrl: "https://gateway.pinata.cloud/ipfs/bafy-test-cid",
      backupKey: asset.backupKey,
    });
  });

  it("does not return a successful result when either provider fails", async () => {
    await expect(
      publishPublicAsset(asset, {
        uploadPublic: vi.fn().mockRejectedValue(new Error("Pinata unavailable")),
        putBackup: vi.fn().mockResolvedValue(undefined),
        gatewayBaseUrl: "https://gateway.pinata.cloud/ipfs",
      }),
    ).rejects.toThrow("Pinata unavailable");

    await expect(
      publishPublicAsset(asset, {
        uploadPublic: vi.fn().mockResolvedValue({ cid: "bafy-orphan" }),
        putBackup: vi.fn().mockRejectedValue(new Error("S3 unavailable")),
        gatewayBaseUrl: "https://gateway.pinata.cloud/ipfs",
      }),
    ).rejects.toThrow("S3 unavailable");
  });
});
