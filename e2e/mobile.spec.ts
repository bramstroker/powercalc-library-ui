import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

// A phone-sized viewport: below the md breakpoint the results become a card list, because a
// five-column table needs roughly twice this width.
test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("renders the results as cards instead of a table", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("library-card-list")).toBeVisible();
  await expect(page.getByRole("grid")).toBeHidden();

  await expect(page.getByText("LCA001")).toBeVisible();
  await expect(page.getByText("Hue White and Color Ambiance A60")).toBeVisible();
});

test("does not scroll sideways", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("library-card-list")).toBeVisible();

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(scrollWidth).toBe(clientWidth);
});

test("filters from the drawer and opens a profile", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Filters" }).click();
  await page
    .getByTestId("facet-deviceType")
    .getByRole("checkbox", { name: /smart_switch/ })
    .click();

  await expect(page).toHaveURL(/deviceType=smart_switch/);

  await page.keyboard.press("Escape");

  await expect(page.getByText("S31")).toBeVisible();
  await expect(page.getByText("LCA001")).toBeHidden();

  await page.getByText("S31").click();

  await expect(page).toHaveURL("/profiles/sonoff/S31");
});
