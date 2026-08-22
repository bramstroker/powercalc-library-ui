import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("exposes every usage dashboard from the analytics overview", async ({ page }) => {
  await page.goto("/analytics");

  const dashboard = (name: string) =>
    page.locator(".MuiCard-root").filter({ hasText: name }).getByRole("link", {
      name: "View Dashboard",
    });

  await expect(dashboard("Sensor Usage")).toBeVisible();
  await expect(dashboard("Installation Statistics")).toBeVisible();
  await expect(dashboard("Profile Usage")).toBeVisible();

  await dashboard("Usage Over Time").click();

  await expect(page).toHaveURL("/analytics/time-series");
  await expect(page.getByRole("heading", { name: "Install Date" })).toBeVisible();
});
