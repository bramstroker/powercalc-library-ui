import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, test } from "node:test";

import {
  budgetFailures,
  extractInitialRequests,
  extractModulePreloads,
  measureBuild,
} from "./check-bundle-size.mjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

test("extracts unique module preloads and declared requests", () => {
  const html = `
    <link rel="modulepreload" href="/assets/home.js">
    <link href="/assets/home.js" rel="modulepreload">
    <link rel="preload" as="fetch" href="https://api.example.test/library">
    <link rel="icon" href="/favicon.svg">
    <img src="/hero.webp">
    <script src="/runtime.js"></script>
  `;

  assert.deepEqual([...extractModulePreloads(html)], ["/assets/home.js"]);
  assert.equal(extractInitialRequests(html), 6);
});

test("measures aggregate homepage, route, HTML, data and request sizes", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "powercalc-performance-"));
  temporaryDirectories.push(directory);
  await mkdir(resolve(directory, "assets"), { recursive: true });
  await mkdir(resolve(directory, "profiles/example"), { recursive: true });

  await Promise.all([
    writeFile(resolve(directory, "assets/shared.js"), "export const shared = 'shared';"),
    writeFile(resolve(directory, "assets/home.js"), "export const home = 'home';"),
    writeFile(resolve(directory, "assets/profile.js"), "export const profile = 'profile';"),
    writeFile(
      resolve(directory, "index.html"),
      '<link rel="modulepreload" href="/assets/shared.js"><link rel="modulepreload" href="/assets/home.js"><link rel="preload" href="/api">',
    ),
    writeFile(
      resolve(directory, "profiles/example/index.html"),
      '<link rel="modulepreload" href="/assets/shared.js"><link rel="modulepreload" href="/assets/profile.js">profile',
    ),
    writeFile(resolve(directory, "profiles/example.data"), "loader data"),
  ]);

  const stats = await measureBuild(directory);

  assert.equal(stats.assets.length, 3);
  assert.equal(stats.homepage.javascriptRequests, 2);
  assert.equal(stats.homepage.initialRequests, 4);
  assert.equal(stats.routes[0].file, "profiles/example/index.html");
  assert.equal(stats.routes[0].routeJavaScriptRequests, 1);
  assert.equal(stats.htmlFiles[0].file, "index.html");
  assert.deepEqual(stats.dataFiles, [{ file: "profiles/example.data", bytes: 11 }]);
});

test("reports every exceeded aggregate budget", () => {
  const stats = {
    assets: [{ file: "assets/app.js", gzipBytes: 2 }],
    homepage: { javascriptGzipBytes: 2, initialRequests: 2 },
    routes: [{ file: "route/index.html", routeJavaScriptGzipBytes: 2 }],
    htmlFiles: [{ file: "index.html", htmlBytes: 2 }],
    dataFiles: [{ file: "route.data", bytes: 2 }],
  };
  const failures = budgetFailures(stats, {
    javascript: {
      individualGzipKiB: 0,
      initialHomepageGzipKiB: 0,
      routeSpecificGzipKiB: 0,
    },
    prerender: { htmlKiB: 0, dataKiB: 0 },
    requests: { initialHomepage: 0 },
  });

  assert.equal(failures.length, 6);
  assert.match(failures.join("\n"), /homepage JavaScript/u);
  assert.match(failures.join("\n"), /route-specific JavaScript/u);
  assert.match(failures.join("\n"), /prerendered HTML/u);
  assert.match(failures.join("\n"), /prerendered data/u);
  assert.match(failures.join("\n"), /initial requests/u);
});
