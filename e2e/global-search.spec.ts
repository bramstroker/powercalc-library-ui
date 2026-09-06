import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

for (const width of [1280, 320]) {
  test(`searches the whole library from other pages at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await mockApi(page);

    for (const path of [
      "/profiles/signify/lca001?tab=json",
      "/manufacturers?q=Philips",
      "/measurement-quality",
    ]) {
      await page.goto(path);
      const search = page.getByRole("textbox", { name: "Search all profiles" });
      await expect(search).toBeVisible();
      await search.fill("S31");
      await page.waitForTimeout(300);
      await expect(page).toHaveURL(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (width === 320) {
        await page.getByRole("button", { name: "Search library", exact: true }).click();
      } else {
        await search.press("Enter");
      }
      await expect(page).toHaveURL("/?q=S31");
      await expect(page.getByRole("link", { name: /S31/ })).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Search all profiles" })).toHaveCount(1);
    }
  });
}
