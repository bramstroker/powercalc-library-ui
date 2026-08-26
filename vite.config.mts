/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";

import { reactRouter } from "@react-router/dev/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Skip the Sentry release/telemetry work when running unit (vitest) or e2e (playwright) tests
const isUnitTest = Boolean(process.env.VITEST);
const isTestRun = Boolean(isUnitTest || process.env.E2E);
// `react-router typegen` loads this config too, and creating a Sentry release for a type check
// is pure noise — only a real build should reach Sentry.
const isBuild = process.argv.includes("build");
// Lets local/verification builds exercise the production bundle without contacting Sentry. Docker
// builds leave this unset and receive their token through a BuildKit secret.
const isSentryUploadDisabled = process.env.SENTRY_DISABLE_AUTO_UPLOAD === "1";

const loadAvatarManifest = (): Record<string, string> => {
  try {
    const manifest = JSON.parse(
      readFileSync(new URL("./public/avatars/manifest.json", import.meta.url), "utf8"),
    ) as unknown;
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return {};

    return Object.fromEntries(
      Object.entries(manifest).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && entry[1].startsWith("/avatars/"),
      ),
    );
  } catch {
    // Development and unit tests work without a downloaded manifest and use GitHub as a fallback.
    return {};
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __AVATAR_PATHS__: JSON.stringify(loadAvatarManifest()),
  },
  plugins: [
    isUnitTest ? react() : reactRouter(),
    ...(isTestRun || !isBuild || isSentryUploadDisabled
      ? []
      : [
          sentryVitePlugin({
            org: "powercalc",
            project: "library-ui",
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              // Source maps are useful only to Sentry and must never reach the public Nginx image.
              filesToDeleteAfterUpload: "build/**/*.map",
            },
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
    // Hidden maps contain no browser-facing sourceMappingURL. Sentry uploads and removes them when
    // configured; the Dockerfile also deletes them before assembling the public image.
    sourcemap: "hidden",
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
