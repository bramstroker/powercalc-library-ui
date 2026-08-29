import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { authorPath, manufacturerPath, profilePath } from "../src/utils/urlSlugs.mjs";
import { SENSOR_DIMENSIONS } from "../src/config/sensorDimensions.mjs";

export const DEFAULT_LIBRARY_API_URL = "https://api.powercalc.nl/library";
const DEFAULT_SITE_URL = "https://library.powercalc.nl";

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const validLastModified = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString().slice(0, 10);
};

const newestDate = (dates) => dates.filter(Boolean).sort().at(-1);

const escapeNginxString = (value) =>
  String(value).replaceAll("\\", "\\\\").replaceAll("$", "\\$").replaceAll('"', '\\"');

export const collectLegacyRedirects = (library) => {
  const redirects = new Map();

  const add = (legacyPath, canonicalPath) => {
    if (legacyPath !== decodeURI(canonicalPath)) redirects.set(legacyPath, canonicalPath);
  };

  for (const manufacturer of library.manufacturers ?? []) {
    const canonicalManufacturerPath = manufacturerPath(manufacturer.dir_name);
    add(`/manufacturer/${manufacturer.dir_name}`, canonicalManufacturerPath);
    add(`/manufacturers/${manufacturer.dir_name}`, canonicalManufacturerPath);

    for (const model of manufacturer.models ?? []) {
      add(
        `/profiles/${manufacturer.dir_name}/${model.id}`,
        profilePath(manufacturer.dir_name, model.id),
      );

      for (const author of model.authors ?? []) {
        if (!author.github) continue;
        const canonicalPath = authorPath(author.github);
        add(`/author/${author.github}`, canonicalPath);
        add(`/contributors/${author.github}`, canonicalPath);
      }
    }
  }

  return [...redirects]
    .map(([from, to]) => ({ from, to }))
    .sort((a, b) => a.from.localeCompare(b.from));
};

export const renderNginxRedirectMap = (redirects) => {
  const mappings = redirects.flatMap(({ from, to }) => [
    `    "${escapeNginxString(from)}" "${escapeNginxString(to)}";`,
    `    "${escapeNginxString(`${from}/`)}" "${escapeNginxString(to)}";`,
  ]);

  return [
    "# Generated from the library API. Do not edit by hand.",
    // Nginx's default 64-byte bucket cannot hold the longest legacy profile URL plus map overhead.
    "map_hash_bucket_size 256;",
    // Both slash variants are emitted, so the complete library exceeds Nginx's default map size.
    "map_hash_max_size 8192;",
    "map $uri $powercalc_legacy_redirect_candidate {",
    '    default "";',
    ...mappings,
    "}",
    "",
    // Nginx string map keys are case-insensitive. Filter an exact, case-sensitive equality so a
    // lowercase canonical URL does not inherit the mapping for its uppercase legacy equivalent.
    'map "$uri|$powercalc_legacy_redirect_candidate" $powercalc_legacy_redirect {',
    "    default $powercalc_legacy_redirect_candidate;",
    '    "~^(.+)\\|\\1$" "";',
    "}",
    "",
  ].join("\n");
};

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

      add(profilePath(manufacturer.dir_name, model.id), modified);

      for (const author of model.authors ?? []) {
        if (!author.github) continue;
        const path = authorPath(author.github);
        authorDates.set(path, newestDate([authorDates.get(path), modified]));
      }
    }

    add(manufacturerPath(manufacturer.dir_name), newestDate(manufacturerDates));
  }

  for (const [path, modified] of authorDates) add(path, modified);

  const libraryModified = newestDate(allDates);
  add("/", libraryModified);
  add("/manufacturers", libraryModified);
  add("/contributors", libraryModified);
  add("/whats-new", libraryModified);

  for (const path of [
    "/statistics",
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

  for (const dimension of Object.keys(SENSOR_DIMENSIONS)) {
    add(`/analytics/sensor-dimensions/${dimension}`);
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
  apiUrl = DEFAULT_LIBRARY_API_URL,
  siteUrl = DEFAULT_SITE_URL,
  outputPath = resolve("build/client/sitemap.xml"),
  redirectsOutputPath = resolve("build/nginx-redirects.conf"),
} = {}) => {
  const response = await fetch(apiUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`Unable to generate sitemap: ${apiUrl} returned HTTP ${response.status}`);
  }

  const library = await response.json();
  const entries = collectSitemapEntries(library);
  if (entries.length === 0) throw new Error("Unable to generate sitemap: library is empty");

  await mkdir(dirname(outputPath), { recursive: true });
  await Promise.all([
    writeFile(outputPath, renderSitemap(entries, siteUrl), "utf8"),
    mkdir(dirname(redirectsOutputPath), { recursive: true }).then(() =>
      writeFile(
        redirectsOutputPath,
        renderNginxRedirectMap(collectLegacyRedirects(library)),
        "utf8",
      ),
    ),
  ]);
  return entries.length;
};

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const count = await generateSitemap({
    apiUrl: process.env.LIBRARY_API_URL,
    siteUrl: process.env.SITE_URL,
    outputPath: process.env.SITEMAP_OUTPUT,
    redirectsOutputPath: process.env.NGINX_REDIRECTS_OUTPUT,
  });
  console.log(`Generated sitemap.xml with ${count} URLs`);
}
