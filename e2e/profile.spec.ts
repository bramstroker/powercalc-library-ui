import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("shows the profile details for a deep linked profile", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await expect(page.getByRole("heading", { name: "Signify LCA001", level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Hue White and Color Ambiance A60", level: 2 }),
  ).toBeVisible();
  await expect(page.getByText("Shelly Plug S")).toBeVisible();
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByText("LCA001", { exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(breadcrumb.getByRole("link", { name: "Signify", exact: true })).toHaveAttribute(
    "href",
    "/manufacturers/signify",
  );

  // The route module's `meta` export renders this; there is exactly one JSON-LD block per page.
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .evaluate((element) => JSON.parse(element.textContent ?? ""));
  expect(structuredData["@graph"].map((item: { "@type": string }) => item["@type"])).toEqual([
    "BreadcrumbList",
    "Dataset",
  ]);
  expect(structuredData["@graph"][1]).toMatchObject({
    name: "Signify LCA001 power profile",
    url: "https://library.powercalc.nl/profiles/signify/lca001",
  });
});

test("loads extended profile data only after opening its tab", async ({ page }) => {
  let profileJsonRequests = 0;
  let downloadRequests = 0;

  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.startsWith("/profile/")) profileJsonRequests += 1;
    if (pathname.startsWith("/download/")) downloadRequests += 1;
  });

  await page.goto("/profiles/signify/LCA001");

  expect(profileJsonRequests).toBe(0);
  expect(downloadRequests).toBe(0);

  await page.getByRole("tab", { name: "JSON" }).click();
  await expect(page.getByRole("tabpanel").getByText(/"calculation_strategy": "lut"/)).toBeVisible();
  expect(profileJsonRequests).toBe(1);
  expect(downloadRequests).toBe(0);

  await page.getByRole("tab", { name: "Graphs" }).click();
  await expect(page.getByText("No graphs are available for this profile.")).toBeVisible();
  expect(downloadRequests).toBe(1);
});

test("shows the usage stats loaded from the analytics endpoint", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await expect(page.getByText("480 opted-in installations")).toBeVisible();
  await expect(page.getByText("12.5% of 3,840 reporting installations")).toBeVisible();
  await expect(page.getByRole("img", { name: "About installation analytics" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Opt in to anonymous analytics" })).toHaveAttribute(
    "href",
    "https://docs.powercalc.nl/misc/analytics/",
  );
});

test("uses a readable device type and a clear empty usage state", async ({ page }) => {
  await page.goto("/profiles/sonoff/S31");

  // Summary values are not repeated in the attributes tab, and the raw identifier never surfaces.
  const deviceType = page.getByText("Smart Switch", { exact: true });
  await expect(deviceType).toHaveCount(1);
  await expect(deviceType).not.toHaveRole("heading");
  await expect(page.getByText("smart_switch", { exact: true })).toHaveCount(0);
  const usage = page.getByText("No opted-in usage yet");
  await expect(usage).toBeVisible();
  await expect(usage).not.toHaveRole("heading");
  await expect(page.getByRole("progressbar")).toBeHidden();
  await page.getByTestId("profile-setup").getByRole("button", { name: "Use this profile" }).click();
  await expect(
    page.getByText("Powercalc can discover this model automatically (by entity)."),
  ).toBeVisible();
});

test("shows the LUT quality with its per color mode breakdown", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await expect(page.getByText("96.1 · Excellent")).toBeVisible();
  await expect(page.getByText("brightness 97.9 · color temp 96.1")).toBeVisible();
});

test("omits the LUT quality for a profile without measured curves", async ({ page }) => {
  await page.goto("/profiles/sonoff/S31");

  await expect(page.getByText("Shelly Plug S").or(page.getByText("Zhurui PR10"))).toBeVisible();
  await expect(page.getByText("LUT quality")).toBeHidden();
});

test("does not show graphs for a fixed profile", async ({ page }) => {
  await page.goto("/profiles/sonoff/S31");

  await expect(page.getByRole("tab", { name: "Graphs" })).toBeHidden();
});

test("shows the voltage range the profile was measured at", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await expect(page.getByText("224.2 – 229.3 V")).toBeVisible();
});

test("omits the voltage range for a profile that did not record it", async ({ page }) => {
  await page.goto("/profiles/sonoff/S31");

  await expect(page.getByText("Voltage range")).toBeHidden();
});

test("navigates back to the library", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await page.getByRole("button", { name: "Back to library" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("4 profiles")).toBeVisible();
});

test("preserves the filtered library URL when navigating back to results", async ({ page }) => {
  await page.goto("/?q=LCA001&manufacturer=Signify");
  await page.getByRole("link", { name: "LCA001", exact: true }).click();

  await page.getByRole("button", { name: "Back to results" }).click();

  await expect(page).toHaveURL("/?q=LCA001&manufacturer=Signify");
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible();
});

test("links attributes to their relevant library pages", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  // The link keeps its own accessible name; the tooltip only describes it. Scope it to the
  // attributes because the heading links to the same manufacturer page.
  const manufacturer = page
    .getByTestId("profile-attribute")
    .getByRole("link", { name: "Signify", exact: true });
  await expect(manufacturer).toBeVisible();

  await manufacturer.click();

  await expect(page).toHaveURL("/manufacturers/signify");
  await expect(page.getByRole("heading", { name: "Signify", level: 1 })).toBeVisible();
});

test("stacks color modes and measurement settings for easier scanning", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const colorModeLinks = page
    .getByTestId("profile-attribute")
    .filter({ hasText: "Color modes" })
    .getByRole("link");
  const colorModeBoxes = await colorModeLinks.evaluateAll((links) =>
    links.map((link) => link.getBoundingClientRect().top),
  );
  expect(colorModeBoxes).toHaveLength(3);
  expect(new Set(colorModeBoxes).size).toBe(3);

  const settingTops = await page
    .getByTestId("measure-setting")
    .evaluateAll((settings) => settings.map((setting) => setting.getBoundingClientRect().top));
  expect(settingTops).toHaveLength(2);
  expect(new Set(settingTops).size).toBe(2);
});

test("keeps long alias lists compact and reveals the full list on demand", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const aliases = page.getByTestId("profile-attribute").filter({ hasText: "Aliases" });
  await expect(aliases.getByText("LWB010")).toBeVisible();
  await expect(aliases.getByText("+1 more")).toBeVisible();
  await expect(page.getByText("LWB014")).toBeHidden();

  await aliases.getByRole("button", { name: "View all 2 aliases" }).click();

  await expect(page.getByText("Aliases (2)")).toBeVisible();
  await expect(page.getByText("LWB014")).toBeVisible();
});

test("keeps barcode lists compact and reveals the full list on demand", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const barcodes = page.getByTestId("profile-attribute").filter({ hasText: "Barcode" });
  await expect(barcodes.getByText("8719514291218")).toBeVisible();
  await expect(barcodes.getByText("+1 more")).toBeVisible();
  await expect(page.getByText("8719514291225")).toBeHidden();

  await barcodes.getByRole("button", { name: "View all 2 barcodes" }).click();

  await expect(page.getByText("Barcodes (2)")).toBeVisible();
  await expect(page.getByText("8719514291225")).toBeVisible();
});

test("top-aligns attribute labels and values in a consistent text column", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const firstAttribute = page.getByTestId("profile-attribute").first();
  const label = await firstAttribute.locator("dt span").boundingBox();
  const value = await firstAttribute.locator("dd").boundingBox();

  expect(label).not.toBeNull();
  expect(value).not.toBeNull();
  expect(Math.abs(label!.x - value!.x)).toBeLessThan(1);

  const measurementSection = page
    .getByRole("heading", { name: "Measurement", level: 2 })
    .locator("xpath=..");
  const valueTops = await measurementSection
    .locator("dd")
    .evaluateAll((values) => values.slice(0, 4).map((item) => item.getBoundingClientRect().top));
  expect(Math.max(...valueTops) - Math.min(...valueTops)).toBeLessThan(1);
});

test("offers manual setup for a profile discovered by entity", async ({ page }) => {
  await page.goto("/profiles/sonoff/S31");

  const setup = page.getByTestId("profile-setup");

  await expect(setup.getByText(/Look for a discovery prompt/)).toBeHidden();
  await setup.getByRole("button", { name: "Use this profile" }).click();
  await expect(setup.getByText(/Look for a discovery prompt/)).toBeVisible();
  await setup.getByText("Set up manually instead").click();

  // The GUI path is what the Powercalc docs recommend, so it leads.
  await expect(setup.getByRole("link", { name: "Open in Home Assistant" })).toHaveAttribute(
    "href",
    "https://my.home-assistant.io/redirect/config_flow_start/?domain=powercalc",
  );
  await expect(setup.getByText("Virtual power (library)")).toBeVisible();

  await setup.getByText("Or configure with YAML").click();

  await expect(setup.getByText("manufacturer: sonoff")).toBeVisible();
  await expect(setup.getByText("model: S31")).toBeVisible();
});

test("hides manual setup for profiles not discovered by entity", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await expect(page.getByText("Automatic, by device")).toBeVisible();
  await expect(page.getByTestId("profile-setup")).toBeHidden();

  await page.goto("/profiles/signify/LCT010");

  await expect(page.getByText("Not available (manual setup only)")).toBeVisible();
  await expect(page.getByTestId("profile-setup")).toBeHidden();
});

test("shows the fields the API publishes beyond the basics", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await expect(page.getByText("SAMPLE_COUNT: 2")).toBeVisible();
  await expect(page.getByText("SLEEP_TIME: 3")).toBeVisible();
  await expect(page.getByText("ESPHome 2026.4.2")).toBeVisible();
  await expect(page.getByText("Automatic, by device")).toBeVisible();

  // linked_profile is "<manufacturer>/<model>", which is exactly the profile route.
  await page.getByRole("link", { name: "ikea/LED1836G9" }).click();

  // The loader redirects a legacy-cased deep link to its slug.
  await expect(page).toHaveURL("/profiles/ikea/led1836g9");
});

test("keeps the open tab in the URL and restores it on reload", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await page.getByRole("tab", { name: "Graphs" }).click();
  await expect(page).toHaveURL(/\?tab=graphs/);

  await page.reload();
  await expect(page.getByRole("tab", { name: "Graphs" })).toHaveAttribute("aria-selected", "true");
});

test("carries the tab through the canonical redirect", async ({ page }) => {
  // A non-canonical path 301s to the slugged one; the query string has to survive that hop or
  // the link silently lands on the first tab.
  await page.goto("/profiles/signify/LCA001?tab=json");

  await expect(page.getByRole("tab", { name: "JSON" })).toHaveAttribute("aria-selected", "true");
});

test("redirects a legacy model ID to the current canonical profile URL", async ({ page }) => {
  await page.goto("/profiles/signify/hue-lca-001?tab=json");

  await expect(page).toHaveURL("/profiles/signify/lca001?tab=json");
  await expect(page.getByRole("tab", { name: "JSON" })).toHaveAttribute("aria-selected", "true");
});

test("shows a stable UTC updated timestamp", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const updated = page.locator('time[datetime="2025-01-02T03:04:05.000Z"]');
  await expect(updated).toHaveText("Jan 2, 2025, 3:04 AM UTC");
});

test("renders an error page for an unknown profile", async ({ page }) => {
  await page.goto("/profiles/signify/does-not-exist");

  await expect(page.getByText("Page not found")).toBeVisible();
  await expect(page.getByText("404 Not Found")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
});

test("shows the device metadata a contributor filled in", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const attributes = page.getByTestId("profile-attribute");

  await expect(attributes.filter({ hasText: "Power range" })).toContainText("0.72 – 9 W");
  await expect(attributes.filter({ hasText: "Rated power" })).toContainText("9.5 W claimed");
  await expect(attributes.filter({ hasText: "Light output" })).toContainText("806 lm · 90 lm/W");
  await expect(attributes.filter({ hasText: "Socket" })).toContainText("E27");
  await expect(attributes.filter({ hasText: "Connectivity" })).toContainText("Zigbee");
  await expect(attributes.filter({ hasText: "Barcode" })).toContainText("8719514291218");
  await expect(attributes.filter({ hasText: "Mains voltage" })).toContainText("230 V");

  await expect(page.getByRole("link", { name: "philips-hue.com" })).toHaveAttribute(
    "href",
    "https://www.philips-hue.com/en-us/p/hue-white-and-color-ambiance-a60",
  );
});

test("marks a standby figure nobody could measure", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  // Standby power is a headline fact rather than one of the listed attributes.
  await expect(page.getByText("estimated, not measured")).toBeVisible();

  // The other profile measured its standby draw, so it carries no caveat.
  await page.goto("/profiles/signify/LCT010");
  await expect(page.getByText("0.3 W")).toBeVisible();
  await expect(page.getByText("estimated, not measured")).toBeHidden();
});

test("separates the measurement date from the profile update date", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await expect(
    page.getByTestId("profile-attribute").filter({ hasText: "Measurements updated" }),
  ).toContainText("May 3, 2024");
});
