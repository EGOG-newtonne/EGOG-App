import {copyFile, mkdir, readFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const videoRoot = resolve(here, "..");
const manifestPath = resolve(videoRoot, "..", "capture-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

if (!manifest.privacyReviewed || manifest.productionOrigin !== "https://egog-app-web.vercel.app") {
  throw new Error("Capture manifest has not passed the Production privacy gate.");
}

const output = resolve(videoRoot, "public", "captures");
await mkdir(output, {recursive: true});

for (const capture of manifest.captures) {
  if (!capture.privacyReviewed) {
    throw new Error(`Capture ${capture.name} has not passed privacy review.`);
  }

  const source = resolve(videoRoot, "..", capture.source);
  await copyFile(source, resolve(output, `${capture.name}.png`));
}
