import { expect, test } from "@playwright/test";

test("offers a focused path to contribute or request a device", async ({ page }) => {
  await page.goto("/contribute");

  await expect(
    page.getByRole("heading", { level: 1, name: "Contribute or request a device" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Contribute or request a device · Powercalc profile library");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://library.powercalc.nl/contribute",
  );
  await expect(page.getByRole("link", { name: "Start measuring" })).toHaveAttribute(
    "href",
    "https://docs.powercalc.nl/contributing/measure/",
  );
  await expect(page.getByText(/exact same physical model/)).toBeVisible();
});

test("documents the library data and links to its public sources", async ({ page }) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", { level: 1, name: "About the profile data" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("About the data · Powercalc profile library");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://library.powercalc.nl/about",
  );
  await expect(page.getByText(/every hour/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Download the full library JSON" })).toHaveAttribute(
    "href",
    /\/library\/full$/,
  );
  await expect(page.getByRole("link", { name: "Read the MIT License" })).toHaveAttribute(
    "href",
    "https://opensource.org/license/mit",
  );
});

test("explains how to assess measurement quality", async ({ page }) => {
  await page.goto("/measurement-quality");

  await expect(page.getByRole("heading", { level: 1, name: "Measurement quality" })).toBeVisible();
  await expect(page).toHaveTitle("Measurement quality · Powercalc profile library");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://library.powercalc.nl/measurement-quality",
  );
  await expect(page.getByRole("heading", { level: 2, name: "LUT quality bands" })).toBeVisible();
  await expect(page.getByText("Excellent: 95–100")).toBeVisible();
  await expect(page.getByText(/Software support is not an accuracy certification/)).toBeVisible();
  await expect(page.getByText(/estimated, not measured/)).toBeVisible();
});
