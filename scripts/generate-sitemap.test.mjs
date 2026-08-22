import assert from "node:assert/strict";
import test from "node:test";

import {
  collectLegacyRedirects,
  collectSitemapEntries,
  renderNginxRedirectMap,
  renderSitemap,
} from "./generate-sitemap.mjs";

const library = {
  manufacturers: [
    {
      dir_name: "brand & co",
      models: [
        {
          id: "model one",
          updated_at: "2026-08-20T12:00:00Z",
          authors: [{ github: "Alice Example" }],
        },
        {
          id: "model-two",
          updated_at: "2026-08-21T12:00:00Z",
          authors: [{ github: "Alice Example" }, { github: "bob" }],
        },
      ],
    },
  ],
};

test("collects canonical profile, manufacturer, and contributor URLs", () => {
  const entries = collectSitemapEntries(library);
  const byPath = new Map(entries.map((entry) => [entry.path, entry.lastModified]));

  assert.equal(byPath.get("/profiles/brand-co/model-one"), "2026-08-20");
  assert.equal(byPath.get("/manufacturers/brand-co"), "2026-08-21");
  assert.equal(byPath.get("/contributors/alice-example"), "2026-08-21");
  assert.equal(byPath.get("/contributors/bob"), "2026-08-21");
  assert.equal(byPath.get("/"), "2026-08-21");
  assert.equal(byPath.get("/contributors"), "2026-08-21");
  assert.equal(byPath.has("/statistics"), true);
});

test("renders valid escaped sitemap XML", () => {
  const xml = renderSitemap(
    [{ path: "/profiles/brand-co/model", lastModified: "2026-08-21" }],
    "https://example.com/",
  );

  assert.match(xml, /<loc>https:\/\/example\.com\/profiles\/brand-co\/model<\/loc>/);
  assert.match(xml, /<lastmod>2026-08-21<\/lastmod>/);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
});

test("generates permanent redirect mappings for legacy entity URLs", () => {
  const redirects = collectLegacyRedirects(library);

  assert.deepEqual(
    redirects.find(({ from }) => from === "/profiles/brand & co/model one"),
    { from: "/profiles/brand & co/model one", to: "/profiles/brand-co/model-one" },
  );
  assert.deepEqual(
    redirects.find(({ from }) => from === "/manufacturers/brand & co"),
    { from: "/manufacturers/brand & co", to: "/manufacturers/brand-co" },
  );
  assert.deepEqual(
    redirects.find(({ from }) => from === "/author/Alice Example"),
    { from: "/author/Alice Example", to: "/contributors/alice-example" },
  );
  assert.deepEqual(
    redirects.find(({ from }) => from === "/author/bob"),
    { from: "/author/bob", to: "/contributors/bob" },
  );
  assert.deepEqual(
    redirects.find(({ from }) => from === "/contributors/Alice Example"),
    { from: "/contributors/Alice Example", to: "/contributors/alice-example" },
  );
  assert.equal(redirects.some(({ from }) => from === "/contributors/bob"), false);

  const config = renderNginxRedirectMap(redirects);
  assert.match(config, /map_hash_bucket_size 256;/);
  assert.match(config, /map_hash_max_size 8192;/);
  assert.match(
    config,
    /"\/manufacturer\/brand & co" "\/manufacturers\/brand-co";/,
  );
  assert.match(
    config,
    /"\/manufacturer\/brand & co\/" "\/manufacturers\/brand-co";/,
  );
  assert.match(config, /map \$uri \$powercalc_legacy_redirect_candidate \{/);
  assert.match(
    config,
    /map "\$uri\|\$powercalc_legacy_redirect_candidate" \$powercalc_legacy_redirect \{/,
  );
  assert.match(config, /"~\^\(\.\+\)\\\|\\1\$" "";/);
});
