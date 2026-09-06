# Powercalc Library Viewer

The public browser and analytics site for the [Powercalc profile library](https://library.powercalc.nl/).
It is a React Router application built with React, TypeScript, Material UI, TanStack Query, and MUI
X charts. Library and usage data come from the [Powercalc API](https://api.powercalc.nl).

## Requirements

- Node.js 22.22 or newer
- npm

## Local development

```sh
npm install
npm run dev
```

The development server prints its local URL. To use another API, set `VITE_API_BASE_URL` before
starting the server.

## Quality checks

```sh
npm run type-check
npm run lint
npm test
npm run test:e2e
npm run format:check
npm run bundle:check # run after a production build
npm run performance:build
npm run performance:check
```

Playwright starts both the application and a local fixture API, so end-to-end tests do not depend
on production data or network availability. CI runs the regular suite with four workers by default;
set `E2E_WORKERS` to override that for a runner with different resources. The mobile performance
test runs separately against the production build so it cannot affect regular E2E timing.

`performance:build` creates a deterministic production build against a separate, representative
749-profile snapshot (see `e2e/performance/fixtures`).
`performance:check` then enforces the limits in `performance-budgets.json`: individual and
aggregate homepage JavaScript, JavaScript added by any other route, prerendered HTML and loader
data, initial homepage requests, plus mobile and desktop LCP, observed interaction latency, and
CLS. Tests use gzip delivery, 4× CPU slowdown, 150 ms latency and 1.6 Mbps download throughput.
They also measure time until the catalogue is usable, actual transferred JavaScript including
dynamic chunks, typo search, facets, pagination and profile navigation. Separate cases cover
unavailable/slow analytics and growth to 2,996 profiles. Each scenario runs twice with fresh browser
contexts to catch intermittent loading shifts. Observed event latency in these scripted
interactions is a lab regression check, not a field INP percentile. Route-specific JavaScript means the
gzip size of modulepreloaded chunks that a route adds on top of the homepage's initial chunk set.
Collection routes have separate raw and compressed payload limits because they contain hundreds
of summaries and crawlable links; detail-page limits remain unchanged.

## Production build

```sh
npm run build
```

The build downloads and optimizes contributor avatars, prerenders canonical library routes, and
generates entity-specific social cards, `sitemap.xml`, plus legacy Nginx redirect mappings in
`build/`. Useful overrides are:

- `LIBRARY_API_URL` — API endpoint used by build-time scripts
- `VITE_API_BASE_URL` — API origin embedded in the application
- `SITE_URL` — canonical origin used by the sitemap generator
- `AVATARS_OUTPUT_DIR` and `AVATAR_SIZE` — avatar generation settings

## Refreshing content without rebuilding

The pages are prerendered from library and analytics data that changes through the day, while
the application itself changes only when the code does. `npm run prerender` renders the documents
again against a build that already exists, writing HTML, `.data` and the SPA fallback without
touching `/assets`:

```sh
npm run prerender -- --out build/client
```

It renders the same set of paths the build does — the routes that take no parameters plus one page
per library entity — and refreshes every profile's social card. `--out` defaults to `build/client`,
`--server` to `build/server/index.js`.

In production this runs as the `renderer` image built from the same commit as the serving container
(`docker compose run --rm renderer`), so a content refresh needs no image build, no container
recreate, and leaves every content-hashed asset URL — and the tabs holding them open — intact. The
`Refresh content` workflow does this hourly.

The catalogue uses the full library API response. The build writes a content hash manifest.
Hourly refreshes render into `/documents/next`, compare
against the serving manifest, and publish only changed files while removing obsolete files.
Only affected canonical URLs, trailing-slash/index variants and loader payloads are purged;
only changed canonical URLs are warmed. The manifest is acknowledged after publishing, purging
and warming succeed, so a failed run can retry the same delta. Pages with query parameters bypass
CDN document caching to avoid unbounded stale variants. Code deployments still invalidate the
whole cache because their asset graph changes. Deploy the new serving and renderer images together
before using this refresh workflow. Rendering itself still visits every route; this optimization
reduces copying, cache invalidation and warm-up traffic.

Brand icons and the social sharing card are generated from `public/favicon.svg`:

```sh
npm run assets:generate
```

## Container image

```sh
docker build --platform=linux/amd64 -t powercalc-library-ui .
docker image tag powercalc-library-ui bramgerritsen/powercalc-library-ui:latest
docker push bramgerritsen/powercalc-library-ui:latest
```
