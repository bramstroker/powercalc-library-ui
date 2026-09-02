import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("lists indexable device-type categories and their profiles", async ({ page }) => {
  await page.goto("/device-types");

  await expect(page.getByRole("heading", { level: 1, name: "Device types" })).toBeVisible();
  const lightCategory = page.getByRole("link", { name: /Light 3 profiles/ });
  const switchCategory = page.getByRole("link", { name: /Smart Switch 1 profile/ });
  await expect(lightCategory).toHaveAttribute("href", "/device-types/light");
  await expect(lightCategory.getByTestId("LightbulbIcon")).toBeVisible();
  await expect(switchCategory.getByTestId("PowerIcon")).toBeVisible();

  await page.goto("/device-types/light");
  await expect(page.getByRole("heading", { level: 1, name: "Light power profiles" })).toBeVisible();
  await expect(page.getByText(/smart bulbs, fixtures, light strips/)).toBeVisible();
  await expect(page.getByTestId("category-profile-list").getByRole("link")).toHaveCount(3);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://library.powercalc.nl/device-types/light",
  );
});

test("keeps arbitrary filter URLs out of the index", async ({ page }) => {
  await page.goto("/?manufacturer=Signify&colorMode=hs&unknown=value");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://library.powercalc.nl/",
  );
});
