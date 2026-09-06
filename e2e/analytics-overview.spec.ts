import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("exposes every usage dashboard from the analytics overview", async ({ page }) => {
  await page.goto("/analytics");

  const dashboards = [
    ["View sensor usage", "/analytics/sensor-dimensions"],
    ["View installation statistics", "/analytics/installations"],
    ["View profile usage", "/analytics/profiles"],
    ["View usage over time", "/analytics/time-series"],
  ];
  for (const [name, href] of dashboards) {
    const link = page.getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
  }

  await page.getByRole("link", { name: "View usage over time", exact: true }).click();

  await expect(page).toHaveURL("/analytics/time-series");
  await expect(page.getByRole("heading", { name: "Install Date" })).toBeVisible();
});
