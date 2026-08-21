import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_API_URL = "https://api.powercalc.nl/library";
const DEFAULT_SITE_URL = "https://library.powercalc.nl";

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const encodeSegment = (value) => encodeURIComponent(String(value));

const validLastModified = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString().slice(0, 10);
};

const newestDate = (dates) => dates.filter(Boolean).sort().at(-1);

export const collectSitemapEntries = (library) => {
  const entries = new Map();
  const authorDates = new Map();
  const allDates = [];

  const add = (path, lastModified) => {
    const existing = entries.get(path);
    entries.set(path, newestDate([existing, validLastModified(lastModified)]));
  };

  for (const manufacturer of library.manufacturers ?? []) {
    const manufacturerDates = [];

    for (const model of manufacturer.models ?? []) {
      const modified = validLastModified(model.updated_at);
      if (modified) {
        manufacturerDates.push(modified);
        allDates.push(modified);
      }

      add(
        `/profiles/${encodeSegment(manufacturer.dir_name)}/${encodeSegment(model.id)}`,
        modified,
      );

      for (const author of model.authors ?? []) {
        if (!author.github) continue;
        const path = `/author/${encodeSegment(author.github)}`;
        authorDates.set(path, newestDate([authorDates.get(path), modified]));
      }
    }

    add(
      `/manufacturer/${encodeSegment(manufacturer.dir_name)}`,
      newestDate(manufacturerDates),
    );
  }

  for (const [path, modified] of authorDates) add(path, modified);

  const libraryModified = newestDate(allDates);
  add("/", libraryModified);
  add("/manufacturers", libraryModified);
  add("/whats-new", libraryModified);

  for (const path of [
    "/statistics/top-measure-devices",
    "/statistics/top-contributors",
    "/statistics/top-manufacturers",
    "/statistics/top-device-types",
    "/statistics/weekly-contributions",
    "/analytics",
    "/analytics/sensor-dimensions",
    "/analytics/installations",
    "/analytics/profiles",
    "/analytics/time-series",
  ]) {
    add(path);
  }

  return [...entries]
    .map(([path, lastModified]) => ({ path, lastModified }))
    .sort((a, b) => a.path.localeCompare(b.path));
};

export const renderSitemap = (entries, siteUrl = DEFAULT_SITE_URL) => {
  const baseUrl = siteUrl.replace(/\/+$/, "");
  const urls = entries.map(({ path, lastModified }) => {
    const lastmod = lastModified ? `\n    <lastmod>${escapeXml(lastModified)}</lastmod>` : "";
    return `  <url>\n    <loc>${escapeXml(`${baseUrl}${path}`)}</loc>${lastmod}\n  </url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
};

export const generateSitemap = async ({
  apiUrl = DEFAULT_API_URL,
  siteUrl = DEFAULT_SITE_URL,
  outputPath = resolve("dist/sitemap.xml"),
} = {}) => {
  const response = await fetch(apiUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`Unable to generate sitemap: ${apiUrl} returned HTTP ${response.status}`);
  }

  const library = await response.json();
  const entries = collectSitemapEntries(library);
  if (entries.length === 0) throw new Error("Unable to generate sitemap: library is empty");

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderSitemap(entries, siteUrl), "utf8");
  return entries.length;
};

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const count = await generateSitemap({
    apiUrl: process.env.LIBRARY_API_URL,
    siteUrl: process.env.SITE_URL,
    outputPath: process.env.SITEMAP_OUTPUT,
  });
  console.log(`Generated sitemap.xml with ${count} URLs`);
}
