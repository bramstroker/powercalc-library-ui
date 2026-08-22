import type { LinkDescriptor } from "react-router";

import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

/**
 * Warms the DNS, TCP and TLS handshake for the API host. Applied site-wide from the root: the
 * profile pages make up most of the library and still call `/analytics/summary` late, after
 * hydration, which would otherwise open that connection cold.
 */
export const apiPreconnectLinks: LinkDescriptor[] = [
  { rel: "preconnect", href: API_BASE_URL, crossOrigin: "anonymous" },
];

/**
 * Starts the library download while the browser is still parsing the document, rather than after
 * the route chunk has loaded and hydration has begun.
 *
 * Only for the routes that actually read the library — the entity pages get theirs from prerendered
 * loader data and would download ~72 kB gzipped of JSON they never touch. `crossOrigin` must match
 * the credential-less `fetch()` in `library.api.ts`, or the browser discards the preload and
 * fetches the response a second time.
 *
 * Both endpoints are listed because `libraryQuery` awaits them together, so the slower of the two
 * gates the render either way.
 */
export const libraryPreloadLinks: LinkDescriptor[] = [
  ...apiPreconnectLinks,
  { rel: "preload", as: "fetch", href: API_ENDPOINTS.LIBRARY, crossOrigin: "anonymous" },
  {
    rel: "preload",
    as: "fetch",
    href: API_ENDPOINTS.ANALYTICS_PROFILES,
    crossOrigin: "anonymous",
  },
];
