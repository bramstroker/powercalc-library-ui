import { fileURLToPath } from "node:url";

const DEFAULT_SITE_URL = "https://library.powercalc.nl";
const LOADER_PATH_PREFIXES = ["/contributors/", "/manufacturers/", "/profiles/"];

const decodeXml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

export const extractSitemapUrls = (xml) =>
  [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gu)].map((match) => decodeXml(match[1]));

export const dataUrlForPage = (pageUrl) => {
  const url = new URL(pageUrl);
  if (!LOADER_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return undefined;

  url.pathname = `${url.pathname.replace(/\/$/u, "")}.data`;
  url.search = "";
  url.hash = "";
  return url.href;
};

export const collectWarmUrls = (xml) => {
  const pageUrls = extractSitemapUrls(xml);
  return [...pageUrls, ...pageUrls.map(dataUrlForPage).filter(Boolean)];
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const fetchWithRetry = async (url, { fetchImpl, retries, retryDelayMs }) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: { "user-agent": "powercalc-cache-warmer/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Fully consume the response so Cloudflare completes its cache write before this job exits.
      await response.arrayBuffer();
      return response.headers.get("cf-cache-status") ?? "UNKNOWN";
    } catch (error) {
      lastError = error;
      if (attempt < retries) await wait(retryDelayMs * (attempt + 1));
    }
  }

  throw new Error(`${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
};

export const warmUrls = async (
  urls,
  { fetchImpl = fetch, concurrency = 12, retries = 2, retryDelayMs = 500 } = {},
) => {
  const statuses = new Map();
  const failures = [];
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < urls.length) {
      const url = urls[nextIndex];
      nextIndex += 1;
      try {
        const status = await fetchWithRetry(url, { fetchImpl, retries, retryDelayMs });
        statuses.set(status, (statuses.get(status) ?? 0) + 1);
      } catch (error) {
        failures.push(error);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(Math.max(1, concurrency), urls.length) }, () => worker()),
  );
  return { failures, statuses };
};

export const warmCloudflareCache = async ({
  siteUrl = DEFAULT_SITE_URL,
  concurrency = 12,
  fetchImpl = fetch,
} = {}) => {
  const baseUrl = siteUrl.replace(/\/+$/u, "");
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const sitemapResponse = await fetchImpl(sitemapUrl, {
    headers: { "user-agent": "powercalc-cache-warmer/1.0" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!sitemapResponse.ok) {
    throw new Error(`Unable to load ${sitemapUrl}: HTTP ${sitemapResponse.status}`);
  }

  const urls = collectWarmUrls(await sitemapResponse.text());
  if (urls.length === 0) throw new Error(`No URLs found in ${sitemapUrl}`);

  const result = await warmUrls(urls, { concurrency, fetchImpl });
  return { ...result, total: urls.length };
};

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule) {
  const concurrency = Number.parseInt(process.env.WARM_CONCURRENCY ?? "12", 10);
  const result = await warmCloudflareCache({
    siteUrl: process.env.WARM_SITE_URL,
    concurrency: Number.isFinite(concurrency) ? concurrency : 12,
  });

  const statusSummary = [...result.statuses]
    .map(([status, count]) => `${status}=${count}`)
    .join(", ");
  console.log(
    `Warmed ${result.total - result.failures.length}/${result.total} URLs (${statusSummary})`,
  );

  if (result.failures.length > 0) {
    for (const failure of result.failures.slice(0, 20)) console.error(failure.message);
    if (result.failures.length > 20) {
      console.error(`...and ${result.failures.length - 20} more failures`);
    }
    process.exitCode = 1;
  }
}
