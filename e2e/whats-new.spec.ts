import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("lists profile additions and measurement updates by merged pull request", async ({ page }) => {
  await page.goto("/whats-new");

  await expect(page.getByRole("heading", { name: "What's new" })).toBeVisible();
  await expect(page).toHaveTitle("What's new · Powercalc profile library");
  await expect(page.getByText("Measurements updated")).toBeVisible();
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
  await expect(page.getByRole("link", { name: "Bram Gerritsen" })).toHaveAttribute(
    "href",
    "/contributors/bramstroker",
  );

  const dayGroups = page.getByTestId("whats-new-day");
  await expect(dayGroups).toHaveCount(2);
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
  await expect(page.getByText("Measurements updated")).toBeVisible();
});

test("is reachable from the Explore menu", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Explore" }).click();
  await page.getByRole("menuitem", { name: "What's new" }).click();

  await expect(page).toHaveURL("/whats-new");
});
