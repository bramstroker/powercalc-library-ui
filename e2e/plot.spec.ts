import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

for (const width of [320, 1280]) {
  test(`enlarges and explores a graph at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await mockApi(page);
    const url =
      "https://raw.githubusercontent.com/bramstroker/homeassistant-powercalc/master/profile_library/signify/LCA001/brightness.svg";
    await page.route("**/download/**", (route) =>
      route.fulfill({ json: [{ path: "brightness.svg", url }] }),
    );
    await page.route(url, (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="white"/><path d="M80 20V520H760" stroke="black"/><text x="350" y="570">Brightness</text></svg>',
      }),
    );
    await page.goto("/profiles/signify/lca001");
    await page.getByRole("tab", { name: "Graphs" }).click();
    await page.getByRole("button", { name: "Enlarge", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Brightness", exact: true });
    await expect(dialog).toBeVisible();
    if (width === 320) {
      await expect.poll(async () => Math.round((await dialog.boundingBox())!.width)).toBe(width);
      await expect.poll(async () => Math.round((await dialog.boundingBox())!.height)).toBe(740);
    }
    await expect(dialog.getByRole("link", { name: "Open original" })).toHaveAttribute("href", url);
    const viewport = dialog.getByLabel("Graph viewport");
    await dialog.getByRole("button", { name: "Zoom in", exact: true }).click({ clickCount: 3 });
    await expect(dialog.getByRole("status")).toHaveText("400%");
    await expect(dialog.getByRole("button", { name: "Zoom in", exact: true })).toBeDisabled();
    await expect.poll(() => viewport.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    await viewport.evaluate((el) => {
      el.scrollLeft = 100;
    });
    await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await dialog.getByRole("button", { name: "Fit", exact: true }).click();
    await expect(dialog.getByRole("status")).toHaveText("100%");
    await expect.poll(() => viewport.evaluate((el) => el.scrollWidth - el.clientWidth)).toBe(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Enlarge", exact: true })).toBeFocused();
    await page.getByRole("button", { name: "Enlarge", exact: true }).click();
    await expect(dialog.getByRole("status")).toHaveText("100%");
    await dialog.getByRole("button", { name: "Close graph" }).click();
    await expect(dialog).toBeHidden();
  });
}
