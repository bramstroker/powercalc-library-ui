import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

for (const width of [1280, 320]) {
  test(`sensor statistics retain percentages and expose all categories at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockApi(page);
    await page.goto("/analytics/sensor-dimensions?metric=percentage");

    await expect(page.getByText(/can add up to more than 100%/)).toBeVisible();
    await expect(
      page.getByText("Top 8 of 10 categories. Open Details for the full list."),
    ).toBeVisible();
    await expect(
      page.getByText("Light: 900 installations · 22.5% of reporting installations"),
    ).toBeVisible();
    await expect(page.getByText(/Humidifier:/)).toHaveCount(0);
    await expect(page.getByText(/^Media Player:/)).toBeVisible();
    await expect(page.getByText(/^User interface:/)).toBeVisible();
    await expect(page.getByText(/^YAML:/)).toBeVisible();
    await expect(page.locator(".MuiBarChart-element").first()).toBeVisible();

    const sourceCard = page.locator(".MuiPaper-root").filter({
      has: page.getByRole("heading", { name: "Source domain", exact: true }),
    });
    await sourceCard.getByRole("button", { name: "Details", exact: true }).click();
    await expect(page).toHaveURL(/by_source_domain\?metric=percentage/);
    const table = page.getByRole("table", { name: "Source domain sensor statistics" });
    await expect(table).toBeVisible();
    await expect(table.getByRole("row")).toHaveCount(11);
    await expect(table.getByRole("rowheader", { name: "Humidifier" })).toBeVisible();
    await expect(table.getByRole("row").filter({ hasText: "Light" })).toContainText("22.5%");

    await page.getByRole("combobox", { name: "Metric" }).click();
    await page.getByRole("option", { name: "Total Count", exact: true }).click();
    await expect(
      page.getByText("Counts represent sensor instances, not installations."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to overview" }).click();
    await expect(page).toHaveURL(/sensor-dimensions\?metric=count$/);
    await expect(page.getByText("Light: 2,700 sensors")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}
