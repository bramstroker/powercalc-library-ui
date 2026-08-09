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

test("offers both the GUI and YAML ways to use the profile", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  const setup = page.getByTestId("profile-setup");

  // The GUI path is what the Powercalc docs recommend, so it leads.
  await expect(
    setup.getByRole("link", { name: /Home Assistant instance/ }),
  ).toHaveAttribute("href", "https://my.home-assistant.io/redirect/config_flow_start/?domain=powercalc");

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
