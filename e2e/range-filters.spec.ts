import { expect, test } from "@playwright/test";
import { mockApi } from "./fixtures/api";

for (const width of [320, 1280]) {
  test(`sets an exact power limit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await mockApi(page);
    await page.goto("/");
    if (width === 320) await page.getByRole("button", { name: /Filters/ }).click();
    const max = page.getByRole("spinbutton", { name: "Maximum standby power (W)" });
    await max.fill("0.5");
    await max.press("Enter");
    await expect(page).toHaveURL(/standbyPower=.*0.5/);
    await expect(
      page.getByRole("slider", { name: "Maximum standby power", exact: true }),
    ).toHaveAttribute("aria-valuetext", "0.5 W");
    await expect(max).toHaveValue("0.5");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}
