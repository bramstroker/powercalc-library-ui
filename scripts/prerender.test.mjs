import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildRouteTree,
  collectPrerenderPaths,
  dataPath,
  refreshPrerenderAllowlist,
  renderPath,
  renderSpaFallback,
} from "./prerender.mjs";

const library = {
  manufacturers: [
    {
      dir_name: "signify",
      models: [
        {
          id: "lct010",
          device_type: "light",
          updated_at: "2026-08-01",
          authors: [{ github: "bramstroker" }],
        },
      ],
    },
  ],
};

const html = (body = "<html></html>") =>
  new Response(body, { headers: { "content-type": "text/html" } });

/** Records what the render asked for, so the request shapes can be asserted. */
const recordingHandler = (respond) => {
  const requests = [];
  const handler = async (request) => {
    requests.push(request);
    return respond(request);
  };
  return { handler, requests };
};

describe("collectPrerenderPaths", () => {
  it("covers the parameterless routes and every library entity", () => {
    const paths = collectPrerenderPaths(library);

    assert.ok(paths.includes("/"));
    assert.ok(paths.includes("/statistics/top-contributors"));
    assert.ok(paths.includes("/profiles/signify/lct010"));
    assert.ok(paths.includes("/manufacturers/signify"));
    assert.ok(paths.includes("/contributors/bramstroker"));
    assert.ok(paths.includes("/manufacturers"));
    assert.ok(paths.includes("/device-types/light"));
    assert.ok(paths.includes("/contribute"));
    assert.ok(paths.includes("/about"));
    assert.ok(paths.includes("/measurement-quality"));
  });

  it("decodes escaped slugs, because that is the form the router matches against", () => {
    const paths = collectPrerenderPaths({
      manufacturers: [{ dir_name: "signify", models: [{ id: "日本" }] }],
    });

    assert.ok(paths.includes("/profiles/signify/日本"));
  });
});

describe("refreshPrerenderAllowlist", () => {
  it("replaces stale build paths while preserving the exported array", () => {
    const prerender = ["/", "/profiles/old/model"];
    const serverBuild = { prerender };

    refreshPrerenderAllowlist(serverBuild, ["/", "/profiles/new/model"]);

    assert.equal(serverBuild.prerender, prerender);
    assert.deepEqual(prerender, ["/", "/profiles/new/model"]);
  });

  it("requires the server build to export a prerender path array", () => {
    assert.throws(() => refreshPrerenderAllowlist({}, ["/"]), {
      message: /does not export a prerender path array/u,
    });
  });
});

describe("buildRouteTree", () => {
  it("nests routes by parent, keeping index routes childless", () => {
    const tree = buildRouteTree({
      root: { id: "root", path: "" },
      layout: { id: "layout", parentId: "root" },
      home: { id: "home", parentId: "layout", index: true },
      profile: { id: "profile", parentId: "layout", path: "profiles/:manufacturer/:model" },
    });

    assert.equal(tree.length, 1);
    const [layout] = tree[0].children;
    assert.deepEqual(
      layout.children.map((route) => route.id),
      ["home", "profile"],
    );
    assert.equal(layout.children[0].index, true);
    assert.ok(!("children" in layout.children[0]));
  });
});

describe("dataPath", () => {
  it("appends .data to a route path", () => {
    assert.equal(dataPath("/manufacturers/signify"), "/manufacturers/signify.data");
  });

  it("uses the index marker for a path that already ends in a slash", () => {
    assert.equal(dataPath("/"), "/_.data");
  });
});

describe("renderPath", () => {
  it("fetches the loader data first and hands it to the document render", async () => {
    const { handler, requests } = recordingHandler((request) =>
      request.url.endsWith(".data") ? new Response('{"loaded":true}') : html(),
    );

    const files = await renderPath(handler, "/manufacturers/signify", { withData: true });

    assert.deepEqual(
      requests.map((request) => new URL(request.url).pathname),
      ["/manufacturers/signify.data", "/manufacturers/signify/"],
    );
    assert.equal(
      requests[1].headers.get("X-React-Router-Prerender-Data"),
      encodeURI('{"loaded":true}'),
    );
    assert.deepEqual(
      files.map((file) => file.path),
      ["/manufacturers/signify.data", "/manufacturers/signify/index.html"],
    );
  });

  it("skips the data request for a route without a loader", async () => {
    const { handler, requests } = recordingHandler(() => html());

    const files = await renderPath(handler, "/statistics", { withData: false });

    assert.deepEqual(
      requests.map((request) => new URL(request.url).pathname),
      ["/statistics/"],
    );
    assert.equal(requests[0].headers.has("X-React-Router-Prerender-Data"), false);
    assert.deepEqual(
      files.map((file) => file.path),
      ["/statistics/index.html"],
    );
  });

  it("leaves out the data header when the payload is too large to carry", async () => {
    const oversized = JSON.stringify({ padding: "x".repeat(9000) });
    const { handler, requests } = recordingHandler((request) =>
      request.url.endsWith(".data") ? new Response(oversized) : html(),
    );

    await renderPath(handler, "/manufacturers/signify", { withData: true });

    assert.equal(requests[1].headers.has("X-React-Router-Prerender-Data"), false);
  });

  it("reports the path when the server build fails to render it", async () => {
    const { handler } = recordingHandler(() => new Response("boom", { status: 500 }));

    await assert.rejects(() => renderPath(handler, "/statistics", { withData: false }), {
      message: /Prerender \(html\): received HTTP 500 .* \/statistics/u,
    });
  });
});

describe("renderSpaFallback", () => {
  it("writes the shell Nginx serves for routes that were never prerendered", async () => {
    const { handler, requests } = recordingHandler(() =>
      html("<html>window.__reactRouterContext = {}</html>"),
    );

    const files = await renderSpaFallback(handler);

    assert.equal(requests[0].headers.get("X-React-Router-SPA-Mode"), "yes");
    assert.deepEqual(
      files.map((file) => file.path),
      ["/__spa-fallback.html"],
    );
  });

  it("refuses a fallback that cannot hydrate", async () => {
    const { handler } = recordingHandler(() => html("<html>no scripts here</html>"));

    await assert.rejects(() => renderSpaFallback(handler), { message: /cannot hydrate/u });
  });
});
