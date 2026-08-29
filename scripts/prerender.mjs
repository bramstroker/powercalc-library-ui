/**
 * Renders the prerendered documents against a build that already exists.
 *
 * `react-router build` normally does this as part of the build, which ties a content refresh to a
 * full rebuild: new asset hashes, a new image, and a container swap, for pages whose only change is
 * data fetched from the API. Driving the server build directly separates the two, so the nightly
 * refresh rewrites documents while the running container keeps serving the same `/assets`.
 *
 * The request shapes below mirror `@react-router/dev`'s own prerender step, because the documents
 * have to be byte-identical to what a build would have produced:
 *
 *   - a route with a loader is asked for `<path>.data` first, and the payload is handed to the
 *     document render through `X-React-Router-Prerender-Data` so the loaders run exactly once;
 *   - the document request carries a trailing slash and is written to `<path>/index.html`;
 *   - `X-React-Router-SPA-Mode` produces `__spa-fallback.html`, the shell Nginx serves for routes
 *     that were never prerendered.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { DEFAULT_LIBRARY_API_URL, collectSitemapEntries } from "./generate-sitemap.mjs";

// Must be set before anything React-adjacent is loaded, which is why `react-router` is imported
// dynamically below: a static import is evaluated before any statement in this module. `react`
// picks its development or production build the first time it is required, and outside production
// MUI labels every generated class (`css-74xscf-MuiPaper-root` instead of `css-409fza`). Those
// names do not match the ones the production client bundle generates, so a hydrating page would
// restyle itself — and a development `react` against a production `react-dom/server` throws.
process.env.NODE_ENV ??= "production";

const { createRequestHandler, matchRoutes } = await import("react-router");

/** React Router drops the header rather than emit one this large; the render then refetches. */
const PRERENDER_DATA_HEADER_LIMIT = 8 * 1024;

/**
 * Which documents to render. `all` covers every entity in the library and is what production
 * builds and the nightly refresh use; anything else renders the routes that take no parameters,
 * which keeps a local build from fetching and rendering thousands of pages.
 */
export const collectPrerenderPaths = (library, mode) =>
  collectSitemapEntries(mode === "all" ? library : { manufacturers: [] }).map(({ path }) =>
    decodeURI(path),
  );

/** Rebuilds the route tree `matchRoutes` needs from the flat route table the server build exports. */
export const buildRouteTree = (routes, parentId = "") =>
  Object.values(routes)
    .filter((route) => (route.parentId ?? "") === parentId)
    .map((route) =>
      route.index
        ? { id: route.id, path: route.path, index: true }
        : { id: route.id, path: route.path, children: buildRouteTree(routes, route.id) },
    );

/** `/manufacturers/signify` -> `/manufacturers/signify.data`, matching the client's fetch. */
export const dataPath = (path) => (path.endsWith("/") ? `${path}_.data` : `${path}.data`);

const documentUrl = (path) => `http://localhost${path.endsWith("/") ? path : `${path}/`}`;

const assertOk = (response, path, kind) => {
  if (response.status === 200 || response.status === 202) return;
  throw new Error(
    `Prerender (${kind}): received HTTP ${response.status} from the server build for ${path}`,
  );
};

/**
 * Renders one path into the files it contributes to the build directory.
 *
 * @returns `{ path, contents }` entries, where `path` is relative to the output directory.
 */
export const renderPath = async (handler, path, { withData }) => {
  const files = [];
  const headers = new Headers();

  if (withData) {
    const response = await handler(new Request(`http://localhost${dataPath(path)}`));
    assertOk(response, path, "data");

    const data = await response.text();
    files.push({ path: dataPath(path), contents: data });

    const encoded = encodeURI(data);
    if (encoded.length < PRERENDER_DATA_HEADER_LIMIT) {
      headers.set("X-React-Router-Prerender-Data", encoded);
    }
  }

  const response = await handler(new Request(documentUrl(path), { headers }));
  assertOk(response, path, "html");
  files.push({ path: `${path}/index.html`, contents: await response.text() });

  return files;
};

/** The shell for routes that were never prerendered. Nginx serves it as the SPA fallback. */
export const renderSpaFallback = async (handler) => {
  const response = await handler(
    new Request("http://localhost/", { headers: { "X-React-Router-SPA-Mode": "yes" } }),
  );
  assertOk(response, "/__spa-fallback.html", "spa");

  const html = await response.text();
  if (!html.includes("window.__reactRouterContext =")) {
    throw new Error("Prerender (spa): the fallback document cannot hydrate without `<Scripts />`");
  }

  return [{ path: "/__spa-fallback.html", contents: html }];
};

const writeFiles = async (outDir, files, onFile) => {
  for (const file of files) {
    const outputPath = join(outDir, ...file.path.replace(/^\/+/u, "").split("/"));
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, file.contents, "utf8");
    onFile?.(outputPath);
  }
};

const fetchLibrary = async (apiUrl) => {
  const response = await fetch(apiUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok)
    throw new Error(`Unable to load the library: ${apiUrl} returned ${response.status}`);
  return response.json();
};

/** Only the `all` mode needs the library; the parameterless routes are known without it. */
const loadLibrary = async (mode, apiUrl) =>
  mode === "all" ? fetchLibrary(apiUrl) : { manufacturers: [] };

/**
 * React Router honours `X-React-Router-Prerender-Data` and `X-React-Router-SPA-Mode` only while
 * this is set, so that a deployed server cannot be steered by client-supplied headers. Without it
 * the loaders run a second time for the document and the SPA fallback comes back as a fully
 * rendered home page instead of the empty shell.
 */
const withBuildRequests = async (run) => {
  const previous = process.env.IS_RR_BUILD_REQUEST;
  process.env.IS_RR_BUILD_REQUEST = "yes";
  try {
    return await run();
  } finally {
    if (previous === undefined) delete process.env.IS_RR_BUILD_REQUEST;
    else process.env.IS_RR_BUILD_REQUEST = previous;
  }
};

export const prerender = async ({
  serverBuild,
  outDir,
  mode,
  apiUrl = DEFAULT_LIBRARY_API_URL,
  onFile,
}) =>
  withBuildRequests(async () => {
    const handler = createRequestHandler(serverBuild, "production");
    const routeTree = buildRouteTree(serverBuild.routes);
    const paths = collectPrerenderPaths(await loadLibrary(mode, apiUrl), mode);

    // Serial by design. The application query client is process-wide during static rendering, so
    // concurrent renders would observe and mutate each other's Suspense state — the same reason
    // `react-router.config.ts` pins the build's own prerender concurrency to 1.
    for (const path of paths) {
      const matches = matchRoutes(routeTree, `${path}/`.replace(/\/\/+/gu, "/"));
      if (!matches) throw new Error(`Prerender: no route matches ${path}`);

      const withData = matches.some((match) => serverBuild.routes[match.route.id]?.module?.loader);
      await writeFiles(outDir, await renderPath(handler, path, { withData }), onFile);
    }

    await writeFiles(outDir, await renderSpaFallback(handler), onFile);

    return paths.length;
  });

const parseArgs = (argv) => {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const [flag, inline] = arg.slice(2).split("=");
    args.set(flag, inline ?? argv[++index]);
  }
  return args;
};

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const args = parseArgs(process.argv.slice(2));
  const outDir = resolve(args.get("out") ?? "build/client");
  const serverPath = resolve(args.get("server") ?? "build/server/index.js");
  const mode = args.get("mode") ?? process.env.PRERENDER_MODE;

  const count = await prerender({
    serverBuild: await import(pathToFileURL(serverPath).href),
    outDir,
    mode,
    apiUrl: process.env.LIBRARY_API_URL ?? DEFAULT_LIBRARY_API_URL,
    onFile: (outputPath) => console.log(`Prerendered ${outputPath}`),
  });

  console.log(`Prerendered ${count} paths into ${outDir}`);
}
