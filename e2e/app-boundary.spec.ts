import { expect, test } from "@playwright/test";

import { E2E_API_BASE_URL, mockApi } from "./fixtures/api";

test("shows a retry screen when the library API is down, and recovers", async ({ page }) => {
  await mockApi(page);

  // Registered after the fixtures so it wins, until we let it fall through to them.
  let failing = true;
  await page.route(`${E2E_API_BASE_URL}/**`, async (route) => {
    if (failing) {
      return route.fulfill({ status: 500, body: "boom" });
    }
    return route.fallback();
  });

  await page.goto("/");

  await expect(page.getByText("The profile library could not be loaded")).toBeVisible({
    timeout: 15000,
  });

  failing = false;
  await page.getByRole("button", { name: "Try again" }).click();

  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible({ timeout: 15000 });
});

test("gives each page its own document title", async ({ page }) => {
  await mockApi(page);

  await page.goto("/");
  await expect(page).toHaveTitle("Powercalc profile library");

  await page.getByRole("gridcell", { name: "LCA001" }).click();
  await expect(page).toHaveTitle("Signify LCA001 · Powercalc profile library");

  await page.goBack();
  await expect(page).toHaveTitle("Powercalc profile library");
});
