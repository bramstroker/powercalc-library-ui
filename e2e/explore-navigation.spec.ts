import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

for (const width of [320, 1280]) {
  test(`opens help and device categories from the menu at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await mockApi(page);
    await page.goto("/");
    for (const [name, path] of [
      ["Device types", "/device-types"],
      ["Measurement quality", "/measurement-quality"],
      ["About", "/about"],
    ]) {
      await page.getByRole("button", { name: "Explore", exact: true }).click();
      const nav = page.getByRole("navigation", { name: "Explore Powercalc" });
      await expect(nav.getByRole("menu", { name: "Find a device" })).toBeVisible();
      await expect(nav.getByRole("menu", { name: "Help", exact: true })).toBeVisible();
      await expect(nav.getByRole("menu", { name: "Community & data" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      await nav.getByRole("menuitem", { name, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(nav).toBeHidden();
      await page.getByRole("button", { name: "Explore", exact: true }).click();
      await expect(nav.getByRole("menuitem", { name, exact: true })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await page.keyboard.press("Escape");
      await expect(nav).toBeHidden();
    }
  });
}
