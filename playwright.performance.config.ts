/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
const API_PORT = 3101;

export default defineConfig({
  testDir: "./e2e/performance",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
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
      url: `http://127.0.0.1:${API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: `npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
      url: `http://127.0.0.1:${PORT}`,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
