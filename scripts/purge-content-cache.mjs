import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { warmUrls } from "./warm-cloudflare-cache.mjs";

export const purgeUrls = async (
  urls,
  { token, zone, fetchImpl = fetch, wait = (ms) => new Promise((done) => setTimeout(done, ms)) },
) => {
  // Conservative batches work with the lowest per-request URL limit. Pace requests so a large
  // refresh does not consume the zone's entire purge rate-limit bucket at once.
  for (let index = 0; index < urls.length; index += 100) {
    const files = urls.slice(index, index + 100);
    for (let attempt = 0; ; attempt++) {
      const response = await fetchImpl(
        `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ files }),
          signal: AbortSignal.timeout(30_000),
        },
      );
      if ((response.status === 429 || response.status >= 500) && attempt < 3) {
        await wait(
          Math.max(1000 * 2 ** attempt, Number(response.headers.get("retry-after") ?? 0) * 1000),
        );
        continue;
      }
      if (!response.ok || !(await response.json()).success)
        throw new Error(`Cloudflare purge failed: HTTP ${response.status}`);
      break;
    }
    if (index + 100 < urls.length) await wait(250);
  }
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const plan = JSON.parse(await readFile(process.argv[2], "utf8"));
  const origin = "https://library.powercalc.nl";
  for (const url of [...plan.purge, ...plan.warm]) {
    if (new URL(url).origin !== origin) throw new Error("Unexpected cache-plan origin");
  }
  if (plan.purge.length && (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE))
    throw new Error("Cloudflare credentials are required");
  await purgeUrls(plan.purge, {
    token: process.env.CLOUDFLARE_API_TOKEN,
    zone: process.env.CLOUDFLARE_ZONE,
  });
  const result = await warmUrls(plan.warm, { concurrency: 6 });
  if (result.failures.length)
    throw new Error(`${result.failures.length} cache warm requests failed`);
  console.log(`Purged ${plan.purge.length} URLs; warmed ${plan.warm.length} changed URLs`);
}
