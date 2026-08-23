import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("renders the library grid with all profiles", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Profile Library" })).toBeVisible();
  await expect(page.getByText("4 profiles")).toBeVisible();

  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "LED1836G9" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "S31" })).toBeVisible();
});

test("filters the grid with the global search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible();

  await page.getByPlaceholder("Search all profiles").fill("TRADFRI");

  await expect(page.getByRole("gridcell", { name: "LED1836G9" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeHidden();
  await expect(page).toHaveURL(/q=TRADFRI/);
});

test("applies a manufacturer filter from the URL query string", async ({ page }) => {
  await page.goto("/?manufacturer=IKEA");

  await expect(page.getByRole("gridcell", { name: "LED1836G9" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeHidden();
  await expect(page.getByRole("gridcell", { name: "S31" })).toBeHidden();

  // The panel reflects the deep link.
  await expect(
    page.getByTestId("facet-manufacturer").getByRole("checkbox", { name: /IKEA/ }),
  ).toBeChecked();
});

test("pushes a filter chosen in the UI back into the URL", async ({ page }) => {
  await page.goto("/");

  await page
    .getByTestId("facet-deviceType")
    .getByRole("checkbox", { name: /smart_switch/ })
    .click();

  await expect(page).toHaveURL(/deviceType=smart_switch/);
  await expect(page.getByRole("gridcell", { name: "S31" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeHidden();
});

test("combines multiple values within a single facet", async ({ page }) => {
  await page.goto("/");

  const deviceType = page.getByTestId("facet-deviceType");
  await deviceType.getByRole("checkbox", { name: /^light/ }).click();
  await deviceType.getByRole("checkbox", { name: /smart_switch/ }).click();

  await expect(page).toHaveURL(/deviceType=light%2Csmart_switch/);
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "S31" })).toBeVisible();
});

test("clears every active filter at once", async ({ page }) => {
  await page.goto("/?deviceType=light&manufacturer=IKEA");

  await expect(page.getByRole("gridcell", { name: "LED1836G9" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "S31" })).toBeHidden();

  await page.getByTestId("active-filter-chips").getByRole("button", { name: "Clear all" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("gridcell", { name: "S31" })).toBeVisible();
});

test("removes a single filter through its chip", async ({ page }) => {
  await page.goto("/?deviceType=light&manufacturer=IKEA");

  await page
    .getByTestId("active-filter-chips")
    .getByRole("button", { name: "Manufacturer: IKEA" })
    .getByTestId("CancelIcon")
    .click();

  await expect(page).toHaveURL("/?deviceType=light");
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible();
});

test("focuses the search box with the / shortcut", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible();

  await page.keyboard.press("/");
  await expect(page.getByPlaceholder("Search all profiles")).toBeFocused();

  // The shortcut must not fire while another field is being typed into.
  const facetSearch = page
    .getByTestId("facet-manufacturer")
    .getByPlaceholder("Search manufacturer");
  await facetSearch.fill("a/b");

  await expect(facetSearch).toHaveValue("a/b");
  await expect(facetSearch).toBeFocused();
});

test("collapses a facet from the keyboard", async ({ page }) => {
  await page.goto("/");

  const header = page.getByTestId("facet-deviceType").getByRole("button", { name: /Device type/ });

  await expect(header).toHaveAttribute("aria-expanded", "true");
  await header.focus();
  await page.keyboard.press("Enter");

  await expect(header).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("facet-deviceType").getByRole("checkbox")).toHaveCount(0);
});

test("filters on the LUT quality band", async ({ page }) => {
  await page.goto("/");

  const qualityBand = page.getByTestId("facet-qualityBand");
  await qualityBand.getByRole("checkbox", { name: /Poor/ }).click();

  await expect(page).toHaveURL(/qualityBand=Poor/);
  await expect(page.getByRole("gridcell", { name: "LCT010" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeHidden();
  await expect(page.getByRole("gridcell", { name: "S31" })).toBeHidden();
});

test("groups profiles without a LUT under the not applicable band", async ({ page }) => {
  await page.goto("/?qualityBand=Not+applicable");

  await expect(page.getByRole("gridcell", { name: "S31" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeHidden();
});

test("opens a profile when its row is clicked", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("gridcell", { name: "LCA001" }).click();

  await expect(page).toHaveURL("/profiles/signify/lca001");
  await expect(page.getByRole("heading", { name: "Signify LCA001" })).toBeVisible();
});
