import type { Config } from "@react-router/dev/config";

import { collectSitemapEntries } from "./scripts/generate-sitemap.mjs";
import { API_ENDPOINTS } from "./src/config/api";

type LibraryJson = {
  manufacturers?: Array<{
    dir_name: string;
    models?: Array<{ id: string; authors?: Array<{ github?: string }> }>;
  }>;
};

const fetchPrerenderPaths = async (): Promise<string[]> => {
  const libraryApiUrl = process.env.LIBRARY_API_URL ?? API_ENDPOINTS.LIBRARY;
  const response = await fetch(libraryApiUrl, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Unable to collect prerender paths: HTTP ${response.status}`);
  }

  const library = (await response.json()) as LibraryJson;
  const paths = collectSitemapEntries(library).map(({ path }: { path: string }) => decodeURI(path));
  if (paths.length === 0) throw new Error("Unable to collect prerender paths: library is empty");

  return paths;
};

export default {
  appDirectory: "src",
  ssr: false,
  /*
   * The list has to name every path, including each library entity: with `ssr: false`, React Router
   * rejects a `loader` export on any route the build does not prerender. Trimming it to speed up a
   * local build is therefore not an option — `scripts/prerender.mjs` renders the same documents
   * against a finished build instead, which is what the nightly content refresh runs.
   */
  prerender: {
    paths: fetchPrerenderPaths,
    // The application query client is process-wide during static rendering. Serializing routes
    // prevents concurrent renders from observing or mutating the same Suspense query state.
    concurrency: 1,
  },
} satisfies Config;
