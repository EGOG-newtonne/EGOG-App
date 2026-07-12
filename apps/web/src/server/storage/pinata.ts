import type { PublicAssetInput } from "./public-assets";

interface PinataUploadResponse {
  data?: { cid?: string };
}

export function createPinataUploader(jwt: string) {
  return async (input: PublicAssetInput) => {
    const form = new FormData();
    form.set(
      "file",
      new File([input.bytes as BlobPart], input.name, { type: input.contentType }),
    );
    form.set("network", "public");
    form.set("name", input.name);

    const response = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: form,
    });
    const body = (await response.json()) as PinataUploadResponse;
    if (!response.ok || !body.data?.cid) {
      throw new Error(`Pinata public upload failed with status ${response.status}`);
    }
    return { cid: body.data.cid };
  };
}
