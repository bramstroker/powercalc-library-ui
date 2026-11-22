import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

for (const width of [320, 1280]) {
  test(`opens help and device categories from the menu at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await mockApi(page);
    await page.goto("/");
    const exploreButton = page.getByRole("button", { name: "Explore", exact: true });
    const nav = page.getByRole("navigation", { name: "Explore Powercalc" });
    const popover = page.locator("#explore-menu");
    await expect(popover).toBeHidden();

    for (const [name, path, heading] of [
      ["Device types", "/device-types", "Device types"],
      ["Measurement quality", "/measurement-quality", "Measurement quality"],
      ["About", "/about", "About the profile data"],
    ]) {
      await exploreButton.click();
      await expect(nav.getByRole("menu", { name: "Find a device" })).toBeVisible();
      await expect(nav.getByRole("menu", { name: "Help", exact: true })).toBeVisible();
      await expect(nav.getByRole("menu", { name: "Community & data" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      await nav.getByRole("menuitem", { name, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(
        page.getByRole("heading", { name: heading, level: 1, exact: true }),
      ).toBeVisible();
      // The navigation leaves the accessibility tree before the popover backdrop stops blocking clicks.
      await expect(popover).toBeHidden();
      await exploreButton.click();
      await expect(nav.getByRole("menuitem", { name, exact: true })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await page.keyboard.press("Escape");
      await expect(popover).toBeHidden();
      await expect(exploreButton).toBeFocused();
    }
  });
}
