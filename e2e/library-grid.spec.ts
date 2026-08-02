import { expect, test } from "@playwright/test";

import { mockApi } from "./fixtures/api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("renders the library grid with all profiles", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Profile Library" })).toBeVisible();
  await expect(page.getByText("4 profiles")).toBeVisible();

  await expect(page.getByRole("cell", { name: "LCA001" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "LED1836G9" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "S31" })).toBeVisible();
});

test("filters the grid with the global search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("cell", { name: "LCA001" })).toBeVisible();

  await page.getByPlaceholder("Search all profiles").fill("TRADFRI");

  await expect(page.getByRole("cell", { name: "LED1836G9" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "LCA001" })).toBeHidden();
});

test("applies a manufacturer filter from the URL query string", async ({ page }) => {
  await page.goto("/?manufacturer=IKEA");

  await expect(page.getByRole("cell", { name: "LED1836G9" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "LCA001" })).toBeHidden();
  await expect(page.getByRole("cell", { name: "S31" })).toBeHidden();
});

test("pushes a filter chosen in the UI back into the URL", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("columnheader", { name: /Device type/ }).getByRole("combobox").click();
  await page.getByRole("option", { name: "smart_switch" }).click();

  await expect(page).toHaveURL(/deviceType=smart_switch/);
  await expect(page.getByRole("cell", { name: "S31" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "LCA001" })).toBeHidden();
});

test("opens a profile when its row is clicked", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("cell", { name: "LCA001" }).click();

  await expect(page).toHaveURL("/profiles/signify/LCA001");
  await expect(page.getByRole("heading", { name: "Signify LCA001" })).toBeVisible();
});
