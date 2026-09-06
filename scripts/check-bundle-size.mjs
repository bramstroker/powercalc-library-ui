import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import budgets from "../performance-budgets.json" with { type: "json" };

const DEFAULT_CLIENT_DIRECTORY = resolve("build/client");

const formatKiB = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;

const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = resolve(directory, entry.name);
        return entry.isDirectory() ? listFiles(path) : [path];
      }),
    )
  ).flat();
};

const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "iu"))?.[1];

export const extractModulePreloads = (html) =>
  new Set(
    [...html.matchAll(/<link\b[^>]*>/giu)].flatMap(([tag]) => {
      if (attribute(tag, "rel") !== "modulepreload") return [];
      const href = attribute(tag, "href");
      return href?.startsWith("/assets/") && href.endsWith(".js") ? [href] : [];
    }),
  );

export const extractInitialRequests = (html) => {
  const urls = new Set();
  const loadedLinkRelations = new Set([
    "apple-touch-icon",
    "icon",
    "manifest",
    "modulepreload",
    "preload",
    "stylesheet",
  ]);

  for (const [tag] of html.matchAll(/<link\b[^>]*>/giu)) {
    if (!loadedLinkRelations.has(attribute(tag, "rel"))) continue;
    const href = attribute(tag, "href");
    if (href) urls.add(href);
  }
  for (const [tag] of html.matchAll(/<(?:img|script)\b[^>]*>/giu)) {
    const src = attribute(tag, "src");
    if (src) urls.add(src);
  }

  // Include the document itself. Inline scripts and inlined SVGs do not create requests.
  return urls.size + 1;
};

const relativeDisplayPath = (clientDirectory, file) =>
  relative(clientDirectory, file).split(sep).join("/");

const assetPath = (clientDirectory, url) => resolve(clientDirectory, url.slice(1));

export const measureBuild = async (clientDirectory = DEFAULT_CLIENT_DIRECTORY) => {
  const allFiles = await listFiles(clientDirectory);
  const javascriptFiles = allFiles.filter(
    (file) => dirname(file) === resolve(clientDirectory, "assets") && file.endsWith(".js"),
  );
  if (javascriptFiles.length === 0) {
    throw new Error(
      `No JavaScript assets found in ${resolve(clientDirectory, "assets")}. Run the build first.`,
    );
  }

  const gzipBytesByUrl = new Map(
    await Promise.all(
      javascriptFiles.map(async (file) => {
        const url = `/${relativeDisplayPath(clientDirectory, file)}`;
        return [url, gzipSync(await readFile(file)).byteLength];
      }),
    ),
  );
  const htmlFiles = allFiles.filter((file) => file.endsWith("index.html"));
  const homeFile = resolve(clientDirectory, "index.html");
  if (!htmlFiles.includes(homeFile)) {
    throw new Error(`Homepage not found at ${homeFile}. Run the build first.`);
  }

  const homeHtml = await readFile(homeFile, "utf8");
  const homeModules = extractModulePreloads(homeHtml);
  const sizeOfModules = (urls) =>
    [...urls].reduce((total, url) => {
      const bytes = gzipBytesByUrl.get(url);
      if (bytes === undefined) {
        throw new Error(
          `Prerender references missing JavaScript asset ${assetPath(clientDirectory, url)}`,
        );
      }
      return total + bytes;
    }, 0);

  const routes = await Promise.all(
    htmlFiles.map(async (file) => {
      const html = file === homeFile ? homeHtml : await readFile(file, "utf8");
      const modules = extractModulePreloads(html);
      const routeModules = new Set([...modules].filter((url) => !homeModules.has(url)));
      return {
        file: relativeDisplayPath(clientDirectory, file),
        htmlBytes: Buffer.byteLength(html),
        htmlGzipBytes: gzipSync(html).byteLength,
        routeJavaScriptGzipBytes: sizeOfModules(routeModules),
        routeJavaScriptRequests: routeModules.size,
      };
    }),
  );
  const dataFiles = await Promise.all(
    allFiles
      .filter((file) => file.endsWith(".data"))
      .map(async (file) => ({
        file: relativeDisplayPath(clientDirectory, file),
        bytes: (await readFile(file)).byteLength,
        gzipBytes: gzipSync(await readFile(file)).byteLength,
      })),
  );
  const assets = [...gzipBytesByUrl].map(([url, gzipBytes]) => ({
    file: url.slice(1),
    gzipBytes,
  }));

  return {
    assets: assets.sort((a, b) => b.gzipBytes - a.gzipBytes),
    homepage: {
      javascriptGzipBytes: sizeOfModules(homeModules),
      javascriptRequests: homeModules.size,
      initialRequests: extractInitialRequests(homeHtml),
    },
    routes: routes.sort((a, b) => b.routeJavaScriptGzipBytes - a.routeJavaScriptGzipBytes),
    htmlFiles: routes.toSorted((a, b) => b.htmlBytes - a.htmlBytes),
    dataFiles: dataFiles.sort((a, b) => b.bytes - a.bytes),
  };
};

const toBytes = (kibibytes) => kibibytes * 1024;

export const budgetFailures = (stats, limits = budgets) => {
  const failures = [];
  const largestAsset = stats.assets[0];
  const largestRoute = stats.routes[0];

  if (largestAsset.gzipBytes > toBytes(limits.javascript.individualGzipKiB)) {
    failures.push(
      `${largestAsset.file} is ${formatKiB(largestAsset.gzipBytes)} gzip; individual JavaScript budget is ${limits.javascript.individualGzipKiB} KiB`,
    );
  }
  if (stats.homepage.javascriptGzipBytes > toBytes(limits.javascript.initialHomepageGzipKiB)) {
    failures.push(
      `homepage JavaScript is ${formatKiB(stats.homepage.javascriptGzipBytes)} gzip; budget is ${limits.javascript.initialHomepageGzipKiB} KiB`,
    );
  }
  if (largestRoute.routeJavaScriptGzipBytes > toBytes(limits.javascript.routeSpecificGzipKiB)) {
    failures.push(
      `${largestRoute.file} adds ${formatKiB(largestRoute.routeJavaScriptGzipBytes)} gzip; route-specific JavaScript budget is ${limits.javascript.routeSpecificGzipKiB} KiB`,
    );
  }
  // Collections serialize hundreds of summaries and retain crawlable links to every profile.
  // Their budgets use the representative 749-profile fixture, with separate transfer limits.
  const isCollection = (file) =>
    /^(manufacturers|contributors|device-types)([/]|[.]data$)/u.test(file);
  for (const html of stats.htmlFiles) {
    const collection = isCollection(html.file) && limits.prerender.collectionHtmlKiB !== undefined;
    const rawLimit = collection ? limits.prerender.collectionHtmlKiB : limits.prerender.htmlKiB;
    if (html.htmlBytes > toBytes(rawLimit))
      failures.push(
        `${html.file} is ${formatKiB(html.htmlBytes)}; prerendered HTML budget is ${rawLimit} KiB`,
      );
    if (collection && html.htmlGzipBytes > toBytes(limits.prerender.collectionHtmlGzipKiB))
      failures.push(`${html.file} exceeds compressed collection HTML budget`);
  }
  for (const data of stats.dataFiles) {
    const collection = isCollection(data.file) && limits.prerender.collectionDataKiB !== undefined;
    const rawLimit = collection ? limits.prerender.collectionDataKiB : limits.prerender.dataKiB;
    if (data.bytes > toBytes(rawLimit))
      failures.push(
        `${data.file} is ${formatKiB(data.bytes)}; prerendered data budget is ${rawLimit} KiB`,
      );
    if (collection && data.gzipBytes > toBytes(limits.prerender.collectionDataGzipKiB))
      failures.push(`${data.file} exceeds compressed collection data budget`);
  }
  if (stats.homepage.initialRequests > limits.requests.initialHomepage) {
    failures.push(
      `homepage declares ${stats.homepage.initialRequests} initial requests; budget is ${limits.requests.initialHomepage}`,
    );
  }

  return failures;
};

const printReport = (stats) => {
  console.log("Largest JavaScript bundles (gzip):");
  for (const asset of stats.assets.slice(0, 10)) {
    console.log(`  ${formatKiB(asset.gzipBytes).padStart(10)}  ${asset.file}`);
  }

  const largestRoute = stats.routes[0];
  const largestHtml = stats.htmlFiles[0];
  const largestData = stats.dataFiles[0];
  console.log("\nAggregate performance budgets:");
  console.log(
    `  Homepage JavaScript: ${formatKiB(stats.homepage.javascriptGzipBytes)} gzip across ${stats.homepage.javascriptRequests} requests / ${budgets.javascript.initialHomepageGzipKiB} KiB`,
  );
  console.log(
    `  Largest route addition: ${formatKiB(largestRoute.routeJavaScriptGzipBytes)} gzip across ${largestRoute.routeJavaScriptRequests} requests (${largestRoute.file}) / ${budgets.javascript.routeSpecificGzipKiB} KiB`,
  );
  console.log(
    `  Largest prerendered HTML: ${formatKiB(largestHtml.htmlBytes)} (${largestHtml.file}) (detail budget ${budgets.prerender.htmlKiB} KiB; collections ${budgets.prerender.collectionHtmlKiB} KiB)`,
  );
  console.log(
    `  Largest prerendered data: ${largestData ? `${formatKiB(largestData.bytes)} (${largestData.file})` : "none"} (detail budget ${budgets.prerender.dataKiB} KiB; collections ${budgets.prerender.collectionDataKiB} KiB)`,
  );
  console.log(
    `  Declared homepage requests: ${stats.homepage.initialRequests} / ${budgets.requests.initialHomepage}`,
  );
};

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const stats = await measureBuild();
  printReport(stats);
  const failures = budgetFailures(stats);
  if (failures.length > 0) {
    throw new Error(`Performance budget exceeded:\n- ${failures.join("\n- ")}`);
  }
  console.log("\nAll static performance budgets are within their limits.");
}
