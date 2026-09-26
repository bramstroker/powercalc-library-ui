/// <reference types="vitest/config" />
import { reactRouter } from "@react-router/dev/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { readFileSync, readdirSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";

import { FLAG_URL } from "./src/config/site";
import { svgAspect } from "./src/utils/svgAspect.mjs";

// Skip the Sentry release/telemetry work when running unit (vitest) or e2e (playwright) tests
const isUnitTest = Boolean(process.env.VITEST);
const isTestRun = Boolean(isUnitTest || process.env.E2E);
// `react-router typegen` loads this config too, and creating a Sentry release for a type check
// is pure noise — only a real build should reach Sentry.
const isBuild = process.argv.includes("build");

const loadAvatarManifest = (): Record<string, string> => {
  try {
    const manifest = JSON.parse(
      readFileSync(new URL("./public/assets/avatars/manifest.json", import.meta.url), "utf8"),
    ) as unknown;
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return {};

    return Object.fromEntries(
      Object.entries(manifest).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && entry[1].startsWith("/assets/avatars/"),
      ),
    );
  } catch {
    // Development and unit tests work without a downloaded manifest and use GitHub as a fallback.
    return {};
  }
};

// Only dimensions are eager. The SVG artwork still loads on demand, while prerendering can
// reserve its final slot. Derive this from the source assets so new logos need no manual index.
const loadLogoAspects = (): Record<string, number> => {
  const directory = new URL("./src/assets/manufacturer-logos/", import.meta.url);
  return Object.fromEntries(
    readdirSync(directory)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => {
        const aspect = svgAspect(readFileSync(new URL(file, directory), "utf8"));
        if (!aspect) throw new Error(`Manufacturer logo ${file} needs a valid viewBox`);
        return [file, aspect];
      }),
  );
};

// Serve country flags from this origin instead of react-country-flag's default third-party CDN.
const FLAG_DIRECTORY = new URL("./node_modules/flag-icons/flags/4x3/", import.meta.url);
const selfHostedFlags = (): Plugin => ({
  name: "self-hosted-flags",
  configureServer(server) {
    server.middlewares.use(FLAG_URL, (req, res, next) => {
      const file = req.url?.slice(1).split("?")[0] ?? "";
      if (!/^[a-z]{2}(?:-[a-z]+)?\.svg$/u.test(file)) return next();
      try {
        const svg = readFileSync(new URL(file, FLAG_DIRECTORY));
        res.setHeader("Content-Type", "image/svg+xml");
        res.end(svg);
      } catch {
        next();
      }
    });
  },
  generateBundle() {
    if (this.environment.name !== "client") return;
    for (const file of readdirSync(FLAG_DIRECTORY).filter((name) => name.endsWith(".svg"))) {
      this.emitFile({
        type: "asset",
        fileName: `${FLAG_URL.slice(1)}${file}`,
        source: readFileSync(new URL(file, FLAG_DIRECTORY)),
      });
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __AVATAR_PATHS__: JSON.stringify(loadAvatarManifest()),
    __MANUFACTURER_LOGO_ASPECTS__: JSON.stringify(loadLogoAspects()),
  },
  plugins: [
    isUnitTest ? react() : reactRouter(),
    selfHostedFlags(),
    ...(isTestRun || !isBuild
      ? []
      : [
          sentryVitePlugin({
            org: "powercalc",
            project: "library-ui",
          }),
        ]),
  ],
  server: {
    port: 3000,
  },
  // React Router loads route modules lazily. Scan them up front so discovering a dependency on the
  // first client-side navigation does not make Vite reload the document back to the current URL.
  optimizeDeps: {
    entries: ["src/**/*.{ts,tsx}"],
  },
  build: {
    // Route bundles can contain server code, so production source maps must not be published.
    sourcemap: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              // Every page hydrates through this runtime. Keep it together, but let MUI split
              // automatically so optional controls cannot pull unrelated UI code into a route.
              name: "react-runtime",
              test: /node_modules[\\/](?:react|react-dom|scheduler|react-router)[\\/]/,
              priority: 20,
            },
            // The small, shared glyphs compress better together than as individual requests.
            { name: "icons", test: /node_modules[\\/]@mui[\\/]icons-material[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
