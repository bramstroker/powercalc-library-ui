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
});

test("shows the usage stats loaded from the analytics endpoint", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await expect(page.getByText("Used in 12.5% of installations")).toBeVisible();
  await expect(page.getByText(/480 out of 3840 total/)).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Profile usage across opted-in installations" }),
  ).toHaveAttribute("aria-valuetext", "12.5%");
  await expect(page.getByRole("button", { name: "About installation analytics" })).toBeVisible();
});

test("uses a readable device type and a clear empty usage state", async ({ page }) => {
  await page.goto("/profiles/sonoff/S31");

  await expect(page.getByText("Smart Switch", { exact: true })).toBeVisible();
  await expect(page.getByText("No opted-in installations reported yet")).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeHidden();
  await expect(page.getByText("Powercalc can discover this model automatically (by entity).")).toBeVisible();
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

test("navigates back to the library", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await page.getByRole("button", { name: "Back to library" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("4 profiles")).toBeVisible();
});

test("links the filterable attributes back into the library", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  // The link keeps its own accessible name; the tooltip only describes it.
  const manufacturer = page.getByRole("link", { name: "Signify", exact: true });
  await expect(manufacturer).toBeVisible();

  await manufacturer.click();

  await expect(page).toHaveURL("/?manufacturer=Signify");
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "S31" })).toBeHidden();
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
  const valueTops = await measurementSection.locator("dd").evaluateAll((values) =>
    values.slice(0, 4).map((item) => item.getBoundingClientRect().top),
  );
  expect(Math.max(...valueTops) - Math.min(...valueTops)).toBeLessThan(1);
});

test("offers both the GUI and YAML ways to use the profile", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const setup = page.getByTestId("profile-setup");

  await expect(setup.getByText(/Look for a discovery prompt/)).toBeVisible();
  await setup.getByText("Set up manually instead").click();

  // The GUI path is what the Powercalc docs recommend, so it leads.
  await expect(setup.getByRole("link", { name: "Open in Home Assistant" })).toHaveAttribute(
    "href",
    "https://my.home-assistant.io/redirect/config_flow_start/?domain=powercalc",
  );
  await expect(setup.getByText("Virtual power (library)")).toBeVisible();

  await setup.getByText("Or configure with YAML").click();

  await expect(setup.getByText("manufacturer: signify")).toBeVisible();
  await expect(setup.getByText("model: LCA001")).toBeVisible();
});

test("shows the fields the API publishes beyond the basics", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await expect(page.getByText("SAMPLE_COUNT: 2, SLEEP_TIME: 3")).toBeVisible();
  await expect(page.getByText("ESPHome 2026.4.2")).toBeVisible();
  await expect(page.getByText("Automatic, by device")).toBeVisible();

  // linked_profile is "<manufacturer>/<model>", which is exactly the profile route.
  await page.getByRole("link", { name: "ikea/LED1836G9" }).click();

  await expect(page).toHaveURL("/profiles/ikea/LED1836G9");
});

test("renders an error page for an unknown profile", async ({ page }) => {
  await page.goto("/profiles/signify/does-not-exist");

  await expect(page.getByText("Something went wrong")).toBeVisible();
  await expect(page.getByText("Unknown profile signify/does-not-exist")).toBeVisible();
});
