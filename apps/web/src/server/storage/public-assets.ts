export interface PublicAssetInput {
  bytes: Uint8Array;
  name: string;
  contentType: string;
  backupKey: string;
}

interface PublishDependencies {
  uploadPublic: (input: PublicAssetInput) => Promise<{ cid: string }>;
  putBackup: (input: PublicAssetInput) => Promise<void>;
  gatewayBaseUrl: string;
}

export async function publishPublicAsset(
  input: PublicAssetInput,
  dependencies: PublishDependencies,
) {
  const [upload] = await Promise.all([
    dependencies.uploadPublic(input),
    dependencies.putBackup(input),
  ]);

  if (!upload.cid.trim()) {
    throw new Error("Pinata returned an empty CID");
  }

  const gatewayBaseUrl = dependencies.gatewayBaseUrl.replace(/\/+$/, "");
  return {
    cid: upload.cid,
    ipfsUri: `ipfs://${upload.cid}`,
    gatewayUrl: `${gatewayBaseUrl}/${upload.cid}`,
    backupKey: input.backupKey,
  };
}
