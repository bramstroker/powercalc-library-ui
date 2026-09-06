import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cachePlan, contentDelta, prepareRefresh, snapshot } from "./content-refresh.mjs";
import { purgeUrls } from "./purge-content-cache.mjs";

test("invalidates all document forms and removed data, never warms deleted routes", () => {
  const delta = contentDelta(
    { "old/index.html": "a", "old.data": "b", "index.html": "c" },
    { "index.html": "c", "profiles/a b/c/index.html": "d" },
  );
  const plan = cachePlan(delta, "https://example.com");
  assert.deepEqual(plan.warm, ["https://example.com/profiles/a%20b/c"]);
  for (const path of ["/old", "/old/", "/old/index.html", "/old.data", "/profiles/a%20b/c/"])
    assert.ok(plan.purge.includes(`https://example.com${path}`));
  assert.ok(!plan.purge.includes("https://example.com/"));
  assert.throws(() => cachePlan({ changed: ["../secret"], removed: [] }));
});

test("copies only changed content and leaves the acknowledged manifest intact until publishing succeeds", async () => {
  const root = await mkdtemp(join(tmpdir(), "content-refresh-"));
  try {
    await mkdir(join(root, "next/assets"), { recursive: true });
    await writeFile(join(root, "next/index.html"), "same");
    await writeFile(join(root, "next/assets/app.js"), "immutable");
    const previous = await snapshot(join(root, "next"));
    assert.deepEqual(Object.keys(previous), ["index.html"]);
    await writeFile(join(root, "previous-manifest.json"), JSON.stringify(previous));
    await writeFile(join(root, "next/library-index.json"), "{}");
    await prepareRefresh(root);
    assert.equal(await readFile(join(root, "delta/library-index.json"), "utf8"), "{}");
    await assert.rejects(readFile(join(root, "delta/index.html")));
    assert.deepEqual(JSON.parse(await readFile(join(root, "previous-manifest.json"))), previous);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("batches URL purges, retries throttling, and rejects API-level failures", async () => {
  const calls = [];
  let attempts = 0;
  await purgeUrls(
    Array.from({ length: 205 }, (_, i) => `https://example.com/${i}`),
    {
      token: "test",
      zone: "zone",
      wait: async () => {},
      fetchImpl: async (_url, options) => {
        if (++attempts === 1) return new Response("", { status: 429 });
        calls.push(JSON.parse(options.body).files);
        return Response.json({ success: true });
      },
    },
  );
  assert.deepEqual(
    calls.map((files) => files.length),
    [100, 100, 5],
  );
  await assert.rejects(
    purgeUrls(["https://example.com/"], {
      token: "test",
      zone: "zone",
      fetchImpl: async () => Response.json({ success: false }),
    }),
  );
});
