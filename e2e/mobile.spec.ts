import { expect, test } from "@playwright/test";

import { E2E_API_BASE_URL, mockApi } from "./fixtures/api";

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

  await expect(page.getByRole("heading", { name: "LCA001", level: 2 })).toBeVisible();
  await expect(page.getByText("Hue White and Color Ambiance A60")).toBeVisible();
});

test("keeps zero-result recovery actions usable", async ({ page }) => {
  await page.goto("/?q=not-a-real-device&manufacturer=Signify");

  const emptyState = page.getByTestId("library-empty-state");
  await expect(emptyState.getByRole("heading", { name: "No matching profiles" })).toBeVisible();
  await expect(
    emptyState.getByRole("button", { name: "Search without manufacturer" }),
  ).toBeVisible();
  await expect(emptyState.getByRole("link", { name: "Measure and contribute" })).toBeVisible();
  await expect(emptyState.getByRole("link", { name: "Ask the community instead" })).toBeVisible();

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBe(clientWidth);
});

test("does not scroll sideways", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("library-card-list")).toBeVisible();

  const layout = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const overflowing = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => element.getBoundingClientRect().right > clientWidth + 1)
      .slice(0, 5)
      .map((element) => ({
        element: element.tagName.toLowerCase(),
        className: element.className?.toString().slice(0, 120),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
      }));

    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth,
      overflowing,
    };
  });

  expect(layout, JSON.stringify(layout.overflowing)).toMatchObject({
    scrollWidth: layout.clientWidth,
  });
});

test("keeps time-series controls and charts within the phone viewport", async ({ page }) => {
  await page.goto("/analytics/time-series");
  await expect(page.getByRole("heading", { name: "Install Date", level: 1 })).toBeVisible();

  const layout = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const overflowing = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => element.getBoundingClientRect().right > clientWidth + 1)
      .slice(0, 5)
      .map((element) => ({
        element: element.tagName.toLowerCase(),
        className: element.className?.toString().slice(0, 120),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
      }));

    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth,
      overflowing,
    };
  });

  expect(layout, JSON.stringify(layout.overflowing)).toMatchObject({
    scrollWidth: layout.clientWidth,
  });
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
  await expect(authorLink).toBeVisible();

  // Scroll on every attempt rather than once. The assertion below is only meaningful from a
  // page that is not already at the top, and on a slow run the profile page is still growing
  // under the first scroll, which leaves it with nothing to do and the window at 0.
  await expect
    .poll(async () => {
      await authorLink.scrollIntoViewIfNeeded();
      return page.evaluate(() => window.scrollY);
    })
    .toBeGreaterThan(0);

  await authorLink.click();

  await expect(page).toHaveURL("/contributors/bramstroker");
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

  // Extended power values belong here; headline figures are intentionally not repeated.
  await expect(
    groups.filter({ hasText: "Power" }).first().getByText("Standby power on"),
  ).toBeVisible();
});

test("keeps every profile tab reachable", async ({ page }) => {
  await page.route(`${E2E_API_BASE_URL}/download/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      // Plot files are named after the colour mode they chart, as the real download API returns
      // them ("color_temp.svg", "hs.svg") — the label the page shows is derived from that name.
      body: JSON.stringify([
        { url: "https://api.powercalc.nl/x/sub/model.json", path: "brightness/model.json" },
        { url: "https://api.powercalc.nl/x/plot.png", path: "brightness.png" },
        { url: "https://api.powercalc.nl/x/plot.svg", path: "brightness.svg" },
      ]),
    }),
  );

  await page.goto("/profiles/signify/LCA001");

  await page.getByRole("tab", { name: "Graphs" }).click();

  await expect(page.getByText("Brightness", { exact: true })).toBeVisible();
});

test("puts the pie chart legend below the chart", async ({ page }) => {
  await page.goto("/analytics/sensor-dimensions");

  const card = page.locator(".MuiPaper-root").filter({ hasText: "Source domain" }).first();
  await expect(card).toBeVisible();

  const pie = await card.locator("path").first().boundingBox();
  const legend = await card
    .locator(".MuiChartsLegend-label", { hasText: "media_player" })
    .boundingBox();

  expect(legend!.y).toBeGreaterThan(pie!.y + pie!.height);
});

test("gives the detail bar chart room for its category labels", async ({ page }) => {
  await page.goto("/analytics/sensor-dimensions/by_source_domain");

  await expect(page.getByRole("heading", { name: "Source Domain", level: 1 })).toBeVisible();

  // Truncated labels render as "media_pla…" when the y axis is too narrow for them.
  await expect(page.locator("tspan", { hasText: /^media_player$/ })).toBeVisible();
  await expect(page.locator("tspan", { hasText: /^binary_sensor$/ })).toBeVisible();
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
