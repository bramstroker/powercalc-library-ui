import type { LinkDescriptor } from "react-router";

import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

/**
 * Warms the DNS, TCP and TLS handshake for the API host.
 *
 * Added per route rather than site-wide: the prerendered entity pages (profile, manufacturer,
 * contributor) carry their data in loader data and never call the API at all, so a root-level hint
 * opened a connection they had no use for on the bulk of the site's pages.
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
