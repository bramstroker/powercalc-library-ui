/// <reference types="vitest/config" />
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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    isUnitTest ? react() : reactRouter(),
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
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
