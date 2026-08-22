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

test("stacks the Explore navigation within the phone viewport", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Explore" }).click();

  await expect(page.getByRole("navigation", { name: "Explore Powercalc" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Browse profiles" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "View statistics" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "View analytics" })).toBeVisible();

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(scrollWidth).toBe(clientWidth);
});

test("keeps the profile within the phone viewport", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");
  await expect(page.getByRole("heading", { name: "Signify LCA001", level: 1 })).toBeVisible();

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(scrollWidth).toBe(clientWidth);
});

test("starts a newly navigated page at the top", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const authorLink = page.getByRole("link", { name: "Bram Gerritsen" });
  await authorLink.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  await authorLink.click();

  await expect(page).toHaveURL("/author/bramstroker");
  await expect(page.getByRole("heading", { level: 1, name: "Bram Gerritsen" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("groups the profile attributes into sections", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const groups = page.getByTestId("attribute-group");
  // allInnerTexts does not auto-wait, so settle on the rendered page first.
  await expect(groups.first()).toBeVisible();

  const headings = (await groups.allInnerTexts()).map((text) => text.split("\n")[0]);

  // The overline variant uppercases the headings in CSS.
  expect(headings).toEqual(["DEVICE", "POWER", "MEASUREMENT", "LIBRARY"]);
  await expect(page.getByRole("heading", { name: "Device", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Power", level: 2 })).toBeVisible();

  // Power figures belong to the Power section, not scattered through the list.
  await expect(groups.filter({ hasText: "Power" }).first().getByText("Max power")).toBeVisible();
});

test("keeps every profile tab reachable", async ({ page }) => {
  await page.route("https://api.powercalc.nl/download/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { url: "https://api.powercalc.nl/x/sub/model.json", path: "brightness/model.json" },
        { url: "https://api.powercalc.nl/x/plot.png", path: "plot_brightness.png" },
        { url: "https://api.powercalc.nl/x/plot.svg", path: "plot_brightness.svg" },
      ]),
    }),
  );

  await page.goto("/profiles/signify/LCA001");

  await page.getByRole("tab", { name: "Graphs" }).click();

  await expect(page.getByText("plot_brightness")).toBeVisible();
});

test("puts the pie chart legend below the chart", async ({ page }) => {
  await page.goto("/analytics/sensor-dimensions");

  const card = page.locator(".MuiPaper-root").filter({ hasText: "Source domain" }).first();
  await expect(card).toBeVisible();

  const pie = await card.locator("path").first().boundingBox();
  const legend = await card.getByText("media_player").boundingBox();

  expect(legend!.y).toBeGreaterThan(pie!.y + pie!.height);
});

test("gives the detail bar chart room for its category labels", async ({ page }) => {
  await page.goto("/analytics/sensor-dimensions/by_source_domain");

  await expect(page.getByRole("heading", { name: "Source Domain", level: 1 })).toBeVisible();

  // Truncated labels render as "media_pla…" when the y axis is too narrow for them.
  await expect(page.getByText("media_player", { exact: true })).toBeVisible();
  await expect(page.getByText("binary_sensor", { exact: true })).toBeVisible();
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

  await expect(page).toHaveURL("/profiles/sonoff/s31");
});
