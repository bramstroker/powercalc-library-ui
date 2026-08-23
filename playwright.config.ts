/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const API_PORT = 3101;
const BASE_URL = `http://localhost:${PORT}`;
const API_URL = `http://127.0.0.1:${API_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `node --experimental-strip-types e2e/fixture-server.mjs`,
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: `npm run dev -- --port ${PORT} --strictPort`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      // Keeps the Sentry vite plugin (release creation + telemetry) out of test runs.
      env: { E2E: "1", VITE_API_BASE_URL: API_URL },
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
