import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("lists recently added profiles, newest first", async ({ page }) => {
  await page.goto("/whats-new");

  await expect(page.getByRole("heading", { name: "What's new" })).toBeVisible();
  await expect(page).toHaveTitle("What's new · Powercalc profile library");
});

test("is reachable from the insights menu", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Insights" }).click();
  await page.getByRole("menuitem", { name: "What's new" }).click();

  await expect(page).toHaveURL("/whats-new");
});
