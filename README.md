# Powercalc Library Viewer

The public browser and analytics site for the [Powercalc profile library](https://library.powercalc.nl/).
It is a React Router application built with React, TypeScript, Material UI, TanStack Query, and MUI
X charts. Library and usage data come from the [Powercalc API](https://api.powercalc.nl).

## Requirements

- Node.js 25 or newer
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
```

Playwright starts both the application and a local fixture API, so end-to-end tests do not depend
on production data or network availability.

## Production build

```sh
npm run build
```

The build downloads and optimizes contributor avatars, prerenders canonical library routes, and
generates `sitemap.xml` plus legacy Nginx redirect mappings in `build/`. Useful overrides are:

- `LIBRARY_API_URL` — API endpoint used by build-time scripts
- `VITE_API_BASE_URL` — API origin embedded in the application
- `SITE_URL` — canonical origin used by the sitemap generator
- `AVATARS_OUTPUT_DIR` and `AVATAR_SIZE` — avatar generation settings

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
