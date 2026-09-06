import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("navigates to a statistics page through the Explore menu and overview", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Explore" }).click();
  await page.getByRole("menuitem", { name: "Library statistics" }).click();

  await expect(page).toHaveURL("/statistics");
  await expect(page.getByRole("heading", { name: "Library statistics" })).toBeVisible();

  await page.getByRole("link", { name: /Top manufacturers/ }).click();

  await expect(page).toHaveURL("/statistics/top-manufacturers");
  await expect(page.getByRole("heading", { name: "Top manufacturers", level: 1 })).toBeVisible();
});

test("links Contributors to the overview and its top-ten ranking", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Explore" }).click();
  await page.getByRole("menuitem", { name: "Contributors" }).click();

  await expect(page).toHaveURL("/contributors");
  await expect(page.getByRole("heading", { name: "Contributors", level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "View top contributors" }).click();

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

test("places the ranking selector below the heading on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/statistics/top-manufacturers");

  const heading = page.getByRole("heading", { name: "Top manufacturers", level: 1 });
  const total = page.getByText("3 total manufacturers");
  const selector = page.getByRole("combobox", { name: "Show" });
  await expect(heading).toBeVisible();
  await expect(selector).toBeVisible();
  const totalBox = await total.boundingBox();
  const selectorBox = await selector.boundingBox();
  expect(selectorBox!.y).toBeGreaterThan(totalBox!.y + totalBox!.height);
  expect(selectorBox!.x + selectorBox!.width).toBeLessThanOrEqual(320);

  await selector.click();
  await page.getByRole("option", { name: "10 results", exact: true }).click();
  await expect(selector).toHaveText("10 results");
  await expect(page.getByRole("row")).toHaveCount(4);
});
