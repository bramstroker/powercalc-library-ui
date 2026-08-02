/// <reference types="vitest/config" />
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Skip the Sentry release/telemetry work when running unit (vitest) or e2e (playwright) tests
const isTestRun = Boolean(process.env.VITEST || process.env.E2E);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(isTestRun
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
  build: {
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
