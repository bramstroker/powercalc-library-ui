import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const nginxConfigUrl = new URL("../etc/nginx.conf", import.meta.url);
const securityHeadersUrl = new URL("../etc/security-headers.conf", import.meta.url);

describe("Nginx security headers", () => {
  it("enforces the expected browser protections", async () => {
    const headers = await readFile(securityHeadersUrl, "utf8");

    for (const header of [
      "Content-Security-Policy",
      "Permissions-Policy",
      "Referrer-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "X-Frame-Options",
    ]) {
      assert.match(headers, new RegExp(`^add_header ${header} `, "mu"));
    }

    assert.match(headers, /frame-ancestors 'none'/u);
    assert.match(headers, /object-src 'none'/u);
    assert.match(headers, /connect-src 'self' https:\/\/api\.powercalc\.nl/u);
  });

  it("repeats the headers in locations that override add_header inheritance", async () => {
    const nginxConfig = await readFile(nginxConfigUrl, "utf8");
    const blocksWithCacheHeaders = nginxConfig.match(/location[^{}]*\{[^{}]*add_header/gu) ?? [];

    assert.ok(blocksWithCacheHeaders.length > 0);
    for (const block of blocksWithCacheHeaders) {
      assert.match(block, /include \/etc\/nginx\/security-headers\.conf;/u);
    }
  });

  it("keeps control characters out of redirect captures", async () => {
    const nginxConfig = await readFile(nginxConfigUrl, "utf8");
    const captures =
      nginxConfig.match(/location ~ \^\/(?:author|manufacturer)\/\(([^)]+)\)/gu) ?? [];

    assert.equal(captures.length, 2);
    for (const capture of captures) {
      assert.match(capture, /\[\^\/\[:cntrl:\]\]\+/u);
    }
  });
});
