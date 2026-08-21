import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("browses from the insights menu to a manufacturer and into a profile", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Insights" }).click();
  await page.getByRole("menuitem", { name: "All manufacturers" }).click();

  await expect(page).toHaveURL("/manufacturers");
  await expect(page.getByText("3 manufacturers, 4 profiles")).toBeVisible();

  await page.getByRole("link", { name: /Signify/ }).click();

  await expect(page).toHaveURL("/manufacturer/signify");
  await expect(page.getByRole("heading", { level: 1, name: "Signify" })).toBeVisible();
  await expect(page.getByText("Also known as: Philips")).toBeVisible();
  await expect(page.getByText("2 profiles")).toBeVisible();

  await page.getByRole("link", { name: /LCA001/ }).click();

  await expect(page).toHaveURL("/profiles/signify/LCA001");
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

test("shows only that manufacturer's profiles on its page", async ({ page }) => {
  await page.goto("/manufacturer/signify");

  await expect(page.getByRole("link", { name: /LCA001/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /LCT010/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /LED1836G9/ })).toBeHidden();

  await page.getByRole("link", { name: "Browse profiles" }).click();

  await expect(page).toHaveURL("/?manufacturer=Signify");
  await expect(page.getByRole("gridcell", { name: "LCA001" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "LED1836G9" })).toBeHidden();
});

test("links from a profile heading back to its manufacturer", async ({ page }) => {
  await page.goto("/profiles/signify/LCA001");

  await page.getByRole("heading", { level: 1 }).getByRole("link", { name: "Signify" }).click();

  await expect(page).toHaveURL("/manufacturer/signify");
});

test("links the top manufacturers table to the manufacturer pages", async ({ page }) => {
  await page.goto("/statistics/top-manufacturers");

  await page.getByRole("link", { name: "Signify" }).click();

  await expect(page).toHaveURL("/manufacturer/signify");
});
