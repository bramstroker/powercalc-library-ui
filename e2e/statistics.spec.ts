import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("navigates to a statistics page through the Explore menu and overview", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Explore" }).click();
  await page.getByRole("menuitem", { name: "View statistics" }).click();

  await expect(page).toHaveURL("/statistics");
  await expect(page.getByRole("heading", { name: "Library statistics" })).toBeVisible();

  await page.getByRole("link", { name: /Top manufacturers/ }).click();

  await expect(page).toHaveURL("/statistics/top-manufacturers");
  await expect(page.getByRole("heading", { name: /Most Common Manufacturers/ })).toBeVisible();
});

test("links Contributors directly to the current top-ten ranking", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Explore" }).click();
  await page.getByRole("menuitem", { name: "Contributors" }).click();

  await expect(page).toHaveURL("/statistics/top-contributors");
  await expect(page.getByRole("heading", { name: /Most Active Contributors/ })).toBeVisible();
});

test("aggregates the profiles per manufacturer, most common first", async ({ page }) => {
  await page.goto("/statistics/top-manufacturers");

  await expect(page.getByText("3 total manufacturers")).toBeVisible();

  const rows = page.getByRole("row");
  await expect(rows.nth(1)).toContainText("Signify");
  await expect(rows.nth(1)).toContainText("2");
});

test("aggregates the profiles per device type", async ({ page }) => {
  await page.goto("/statistics/top-device-types");

  await expect(page.getByText("2 total device types")).toBeVisible();

  const rows = page.getByRole("row");
  await expect(rows.nth(1)).toContainText("light");
  await expect(rows.nth(1)).toContainText("3");
});
