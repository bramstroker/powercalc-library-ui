import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("lists profile additions and measurement updates by merged pull request", async ({ page }) => {
  await page.goto("/whats-new");

  await expect(page.getByRole("heading", { name: "What's new" })).toBeVisible();
  await expect(page).toHaveTitle("What's new · Powercalc profile library");
  await expect(
    page.getByText("Measurements updated", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByText("New profile")).toHaveCount(2);
  await expect(page.getByText("Improve Signify LCA001 measurements")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Pull request #5002" })).toHaveAttribute(
    "href",
    "https://github.com/bramstroker/homeassistant-powercalc/pull/5002",
  );
  await expect(page.getByRole("link", { name: "Signify LCA001" })).toHaveAttribute(
    "href",
    "/profiles/signify/lca001",
  );
  await expect(
    page
      .getByTestId("whats-new-pull-request")
      .first()
      .getByRole("link", { name: "Bram Gerritsen" }),
  ).toHaveAttribute("href", "/contributors/bramstroker");

  const dayGroups = page.getByTestId("whats-new-day");
  await expect(dayGroups).toHaveCount(3);
  await expect(dayGroups.nth(1).getByTestId("whats-new-pull-request")).toHaveCount(2);

  // The API filters PRs, while the UI filters nested changes within a mixed PR as well.
  await expect(page.getByText("Sonoff S31")).toHaveCount(0);

  await page.getByRole("button", { name: "Added profiles" }).click();
  await expect(page).toHaveURL("/whats-new?type=profile_added");
  await expect(page.getByText("New profile")).toHaveCount(2);
  await expect(page.getByText("Measurements updated")).toHaveCount(0);

  await page.getByRole("button", { name: "Updated measurements" }).click();
  await expect(page).toHaveURL("/whats-new?type=measurement_updated");
  await expect(page.getByText("New profile")).toHaveCount(0);
  await expect(
    page.getByText("Measurements updated", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
});

test("is reachable from the Explore menu", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Explore" }).click();
  await page.getByRole("menuitem", { name: "What's new" }).click();

  await expect(page).toHaveURL("/whats-new");
});

test("collapses large batches and keeps every profile reachable by keyboard on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/whats-new");
  const summary = page
    .locator("summary")
    .filter({ hasText: "Measurements updated for 12 profiles" });
  const batch = page.getByTestId("whats-new-pull-request").filter({ has: summary });
  const lastProfile = batch.getByRole("link", { name: "Signify BATCH12", includeHidden: true });
  await expect(summary).toBeVisible();
  await expect(lastProfile).toBeHidden();
  await expect(batch.getByRole("link", { name: "Pull request #4999" })).toBeVisible();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(lastProfile).toBeVisible();
  await expect(lastProfile).toHaveAttribute("href", "/profiles/signify/batch12");
  await page.keyboard.press("Space");
  await expect(lastProfile).toBeHidden();
  await expect(summary).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.getByRole("button", { name: "Added profiles" }).click();
  await expect(summary).toHaveCount(0);
  await page.getByRole("button", { name: "All changes" }).click();
  await expect(summary).toBeVisible();
  await expect(lastProfile).toBeHidden();
});
