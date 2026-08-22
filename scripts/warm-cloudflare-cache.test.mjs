import assert from "node:assert/strict";
import test from "node:test";

import {
  collectWarmUrls,
  dataUrlForPage,
  extractSitemapUrls,
  warmUrls,
} from "./warm-cloudflare-cache.mjs";

const sitemap = `<?xml version="1.0"?>
<urlset>
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/contributors/alice</loc></url>
  <url><loc>https://example.com/manufacturers/acme</loc></url>
  <url><loc>https://example.com/profiles/acme/model-one</loc></url>
  <url><loc>https://example.com/analytics?range=day&amp;view=all</loc></url>
</urlset>`;

test("extracts and decodes sitemap URLs", () => {
  assert.deepEqual(extractSitemapUrls(sitemap), [
    "https://example.com/",
    "https://example.com/contributors/alice",
    "https://example.com/manufacturers/acme",
    "https://example.com/profiles/acme/model-one",
    "https://example.com/analytics?range=day&view=all",
  ]);
});

test("adds data URLs only for routes with prerendered loader data", () => {
  assert.equal(
    dataUrlForPage("https://example.com/profiles/acme/model-one"),
    "https://example.com/profiles/acme/model-one.data",
  );
  assert.equal(dataUrlForPage("https://example.com/analytics"), undefined);

  const urls = collectWarmUrls(sitemap);
  assert.equal(urls.length, 8);
  assert.ok(urls.includes("https://example.com/contributors/alice.data"));
  assert.ok(urls.includes("https://example.com/manufacturers/acme.data"));
});

test("retries failed cache fills and reports cache statuses", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) return new Response("temporary", { status: 503 });
    return new Response("ok", { headers: { "cf-cache-status": "MISS" } });
  };

  const result = await warmUrls(["https://example.com/profile"], {
    fetchImpl,
    concurrency: 1,
    retries: 1,
    retryDelayMs: 0,
  });

  assert.equal(calls, 2);
  assert.equal(result.failures.length, 0);
  assert.equal(result.statuses.get("MISS"), 1);
});
