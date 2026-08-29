import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("browses from the Explore menu to a manufacturer and into a profile", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Explore" }).click();
  await page.getByRole("menuitem", { name: "Manufacturers" }).click();

  await expect(page).toHaveURL("/manufacturers");
  await expect(page.getByRole("link", { name: "Powercalc Profile Library" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(page.getByText("3 manufacturers, 4 profiles")).toBeVisible();

  await page.getByRole("link", { name: /Signify/ }).click();

  await expect(page).toHaveURL("/manufacturers/signify");
  await expect(page.getByRole("heading", { level: 1, name: "Signify" })).toBeVisible();
  await expect(page.getByText("Also known as: Philips")).toBeVisible();
  await expect(page.getByText("2 profiles across 1 device type")).toBeVisible();

  await page.getByRole("link", { name: /LCA001/ }).click();

  await expect(page).toHaveURL("/profiles/signify/lca001");
});

test("filters the manufacturer index and sorts it by name", async ({ page }) => {
  await page.goto("/manufacturers");

  await page.getByPlaceholder("Search manufacturers").fill("ikea");

  const cards = page.getByTestId("manufacturer-list").getByRole("link");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("IKEA");

  await page.getByPlaceholder("Search manufacturers").fill("");
  await page.getByRole("button", { name: "Name" }).click();

  await expect(cards.first()).toContainText("IKEA");
  await expect(cards.last()).toContainText("Sonoff");
});

test("keeps the sorting when returning from a manufacturer page", async ({ page }) => {
  await page.goto("/manufacturers");

  await page.getByRole("button", { name: "Name" }).click();
  await expect(page).toHaveURL("/manufacturers?sort=name");

  await page.getByRole("link", { name: /Signify/ }).click();
  await expect(page).toHaveURL("/manufacturers/signify");

  await page.goBack();

  await expect(page).toHaveURL("/manufacturers?sort=name");
  await expect(page.getByRole("button", { name: "Name" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("manufacturer-list").getByRole("link").first()).toContainText(
    "IKEA",
  );
});

test("shows only that manufacturer's profiles on its page", async ({ page }) => {
  await page.goto("/manufacturers/signify");

  await expect(page.getByRole("link", { name: /LCA001/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /LCT010/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /LED1836G9/ })).toBeHidden();

  await page.getByRole("link", { name: "Browse profiles" }).click();

  await expect(page).toHaveURL("/?manufacturer=Signify");
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "LED1836G9" })).toBeHidden();
});

test("keeps the profile sort of a manufacturer page in the URL", async ({ page }) => {
  await page.goto("/manufacturers/signify");

  const models = page.getByTestId("manufacturer-profile-list").getByRole("heading", { level: 3 });
  await expect(models).toHaveText(["LCA001", "LCT010"]);

  await page.getByRole("button", { name: "Name" }).click();

  await expect(page).toHaveURL("/manufacturers/signify?sort=name");
  await expect(models).toHaveText(["LCT010", "LCA001"]);

  await page.getByRole("link", { name: /LCT010/ }).click();
  await expect(page).toHaveURL("/profiles/signify/lct010");

  await page.goBack();

  await expect(page).toHaveURL("/manufacturers/signify?sort=name");
  await expect(page.getByRole("button", { name: "Name" })).toHaveAttribute("aria-pressed", "true");
});

test("links from a profile heading back to its manufacturer", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await page.getByRole("heading", { level: 1 }).getByRole("link", { name: "Signify" }).click();

  await expect(page).toHaveURL("/manufacturers/signify");
});

test("links the top manufacturers table to the manufacturer pages", async ({ page }) => {
  await page.goto("/statistics/top-manufacturers");

  await page.getByRole("link", { name: "Signify" }).click();

  await expect(page).toHaveURL("/manufacturers/signify");
});

test("shows the brand details a manufacturer carries", async ({ page }) => {
  await page.goto("/manufacturers/signify");

  await expect(page.getByText("Netherlands")).toBeVisible();
  await expect(
    page.getByText("Dutch lighting manufacturer, formerly Philips Lighting."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Brand website" })).toHaveAttribute(
    "href",
    "https://www.signify.com",
  );
});

test("leaves out brand details a manufacturer does not have", async ({ page }) => {
  await page.goto("/manufacturers/ikea");

  await expect(page.getByRole("heading", { level: 1, name: "IKEA" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Brand website" })).toBeHidden();
});
