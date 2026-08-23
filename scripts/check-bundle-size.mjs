import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const ASSETS_DIRECTORY = resolve("build/client/assets");
const MAX_GZIP_BYTES = 130 * 1024;

const formatKiB = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;

const assetNames = (await readdir(ASSETS_DIRECTORY)).filter((name) => name.endsWith(".js"));
if (assetNames.length === 0) {
  throw new Error(`No JavaScript assets found in ${ASSETS_DIRECTORY}. Run the build first.`);
}

const assets = await Promise.all(
  assetNames.map(async (name) => {
    const contents = await readFile(resolve(ASSETS_DIRECTORY, name));
    return { name, gzipBytes: gzipSync(contents).byteLength };
  }),
);

assets.sort((a, b) => b.gzipBytes - a.gzipBytes);

console.log("Largest JavaScript bundles (gzip):");
for (const asset of assets.slice(0, 10)) {
  console.log(`  ${formatKiB(asset.gzipBytes).padStart(10)}  ${asset.name}`);
}

const oversizedAssets = assets.filter(({ gzipBytes }) => gzipBytes > MAX_GZIP_BYTES);
if (oversizedAssets.length > 0) {
  throw new Error(
    `Bundle budget exceeded: ${oversizedAssets.map(({ name, gzipBytes }) => `${name} (${formatKiB(gzipBytes)})`).join(", ")} exceed ${formatKiB(MAX_GZIP_BYTES)}.`,
  );
}

console.log(`All JavaScript bundles are within the ${formatKiB(MAX_GZIP_BYTES)} gzip budget.`);
