import { expect, test } from "@playwright/test";

import { library, mockApi } from "./fixtures/api";

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`restores page two after a profile visit at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await mockApi(page);
    const manufacturer = library.manufacturers[0];
    const model = manufacturer.models[0];
    await page.route("**/library/full", (route) =>
      route.fulfill({
        json: {
          manufacturers: [
            {
              ...manufacturer,
              models: [
                ...Array.from({ length: 29 }, (_, i) => ({
                  ...model,
                  id: `TEST${i}`,
                  aliases: [],
                  legacy_ids: [],
                })),
                model,
              ],
            },
          ],
        },
      }),
    );
    // Start on a page without library data so the client loads the larger fixture.
    await page.goto("/about");
    await page.getByRole("link", { name: "Profile Library" }).click();
    await page.getByRole("button", { name: "Go to next page" }).click();
    await expect(page).toHaveURL("/?page=2");
    await expect(page.getByText("26–30 of 30")).toBeVisible();
    await page
      .getByRole("link", {
        name: viewport.width < 600 ? /LCA001/ : "LCA001",
        exact: viewport.width > 600,
      })
      .click();
    await page.getByRole("button", { name: "Back to results" }).click();
    await expect(page).toHaveURL("/?page=2");
    await expect(page.getByText("26–30 of 30")).toBeVisible();
  });
}
