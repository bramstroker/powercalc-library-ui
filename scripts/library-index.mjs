import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_LIBRARY_API_URL } from "./generate-sitemap.mjs";

// Keep search/filter metadata and all canonical and legacy identities. Detail loaders continue
// using the full API; this projection is exclusively for catalogue browsing.
const DETAIL_FIELDS = new Set([
  "measure_description", "measure_settings", "hash", "manufacturer", "description",
  "product_url", "measure_device_firmware", "fields", "multi_switch_config",
]);
export const createLibraryIndex = (library) => ({
  manufacturers: library.manufacturers.map((manufacturer) => ({
    ...manufacturer,
    models: manufacturer.models.map((model) => ({
      ...Object.fromEntries(Object.entries(model).filter(([key]) => !DETAIL_FIELDS.has(key))),
      description: null,
      measure_description: null,
    })),
  })),
});

export const writeLibraryIndex = async (library, outDir) => {
  const path = resolve(outDir, "library-index.json");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(createLibraryIndex(library)));
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const response = await fetch(process.env.LIBRARY_API_URL ?? DEFAULT_LIBRARY_API_URL, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Library index: HTTP ${response.status}`);
  await writeLibraryIndex(await response.json(), "build/client");
}
