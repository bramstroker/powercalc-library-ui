/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
const API_PORT = 3101;

export default defineConfig({
  testDir: "./e2e/performance",
  fullyParallel: false,
  timeout: 120_000,
  forbidOnly: true,
  retries: 0,
  // Slow parsing can expose intermittent style-order shifts; exercise two cold starts in CI.
  repeatEach: 2,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Recording DOM snapshots/screenshots on every action adds work to the throttled browser.
    // Keep the measured runs untraced; use --trace on only for a separate diagnostic run.
    trace: "off",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"], browserName: "chromium" },
    },
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], browserName: "chromium" },
    },
  ],
  webServer: [
    {
      command: "node --experimental-strip-types e2e/fixture-server.mjs",
      env: { PERFORMANCE_FIXTURE: "1" },
      url: `http://127.0.0.1:${API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: "node e2e/performance/server.mjs",
      url: `http://127.0.0.1:${PORT}`,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
