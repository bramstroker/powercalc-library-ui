import assert from "node:assert/strict";
import test from "node:test";

import { collectSitemapEntries, renderSitemap } from "./generate-sitemap.mjs";

const library = {
  manufacturers: [
    {
      dir_name: "brand & co",
      models: [
        {
          id: "model one",
          updated_at: "2026-08-20T12:00:00Z",
          authors: [{ github: "alice" }],
        },
        {
          id: "model-two",
          updated_at: "2026-08-21T12:00:00Z",
          authors: [{ github: "alice" }, { github: "bob" }],
        },
      ],
    },
  ],
};

test("collects canonical profile, manufacturer, and author URLs", () => {
  const entries = collectSitemapEntries(library);
  const byPath = new Map(entries.map((entry) => [entry.path, entry.lastModified]));

  assert.equal(byPath.get("/profiles/brand%20%26%20co/model%20one"), "2026-08-20");
  assert.equal(byPath.get("/manufacturer/brand%20%26%20co"), "2026-08-21");
  assert.equal(byPath.get("/author/alice"), "2026-08-21");
  assert.equal(byPath.get("/author/bob"), "2026-08-21");
  assert.equal(byPath.get("/"), "2026-08-21");
});

test("renders valid escaped sitemap XML", () => {
  const xml = renderSitemap(
    [{ path: "/profiles/brand%20%26%20co/model", lastModified: "2026-08-21" }],
    "https://example.com/",
  );

  assert.match(xml, /<loc>https:\/\/example\.com\/profiles\/brand%20%26%20co\/model<\/loc>/);
  assert.match(xml, /<lastmod>2026-08-21<\/lastmod>/);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
});
